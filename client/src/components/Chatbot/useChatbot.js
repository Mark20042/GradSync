import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  askChatbot,
  toChatbotRole,
  describeChatbotError,
} from "../../utils/chatbotClient";

const STORAGE_KEY = "gradsync_chat_history";
const MAX_STORED = 40;

const greetingFor = (user) => {
  const name = user?.fullName?.split(" ")[0];
  if (!user) {
    return "Beep boop! I'm Bibo, GradSync's BFF. Ask me anything about him (I know him really well 😉), or challenge me to a digital staring contest! (I always win).";
  }
  return `Hi ${name}! Beep boop, I'm Bibo, your BFF. GradSync is one of my best friends, so I'm here to help you with anything you need.`;
};

export const useChatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isSending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
    }
    setMessages([
      { id: "greeting", role: "assistant", content: greetingFor(user) },
    ]);
  }, [user]);

  useEffect(() => {
    if (!messages.length) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-MAX_STORED))
      );
    } catch {
    }
  }, [messages]);

  const send = useCallback(
    async (raw) => {
      const text = raw.trim();
      if (!text || isSending) return;

      setError(null);
      const userMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMessage]);
      setSending(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result = await askChatbot(text, toChatbotRole(user), {
          signal: controller.signal,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: result.answer,
            inScope: result.inScope,
            sources: result.sources,
          },
        ]);
      } catch (err) {
        const message = describeChatbotError(err);
        if (message) {
          setError(message);
          setMessages((prev) => [
            ...prev,
            {
              id: `e-${Date.now()}`,
              role: "assistant",
              content: message,
              isError: true,
            },
          ]);
        }
      } finally {
        setSending(false);
        abortRef.current = null;
      }
    },
    [isSending, user]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setSending(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    sessionStorage.removeItem(STORAGE_KEY);
    setMessages([
      { id: "greeting", role: "assistant", content: greetingFor(user) },
    ]);
    setError(null);
    setSending(false);
  }, [user]);

  return { messages, isSending, error, send, stop, reset, user };
};

export default useChatbot;
