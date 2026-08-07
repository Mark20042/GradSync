import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import ChatLauncher from "./ChatLauncher";
import ChatPanel from "./ChatPanel";
import useChatbot from "./useChatbot";
import { useAuth } from "../../context/AuthContext";

const HINT_KEY = "gradsync_chat_hint_seen";

/**
 * Routes where a floating assistant would get in the way: the pages are
 * timed, proctored, or full-screen experiences.
 */
const HIDDEN_ON = [
  "/assessment-taking",
  "/interview-room",
  "/setup-profile-grad",
  "/setup-profile-jobseeker",
];

const ChatWidget = () => {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  const chat = useChatbot();
  const [isOpen, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowHint(true), 2000);
    
    const hideTimer = setTimeout(() => {
      setShowHint(false);
    }, 8000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem(HINT_KEY, "1");
  };

  useEffect(() => {
    if (!isOpen) return;
    const isMobile = window.innerWidth < 640;
    if (!isMobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const toggle = () => {
    setOpen((open) => !open);
    if (showHint) dismissHint();
  };

  if (loading) return null;
  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) return null;
  if (!import.meta.env.VITE_CHATBOT_API_URL) return null;

  const role = user?.isAdmin
    ? "admin"
    : user?.role === "employer"
      ? "employer"
      : user
        ? "graduate"
        : "guest";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatPanel onClose={() => setOpen(false)} chat={chat} role={role} />
        )}
      </AnimatePresence>

      <ChatLauncher
        isOpen={isOpen}
        onClick={toggle}
        showHint={showHint}
        onDismissHint={dismissHint}
      />
    </>
  );
};

export default ChatWidget;
