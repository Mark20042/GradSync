import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import toast from "react-hot-toast";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  RefreshCw,
  ChevronRight,
  Check,
  ArrowLeft,
  Loader2,
  Shield,
  BookOpen,
  Camera,
  CheckCircle,
  AlertTriangle,
  Clock,
  Volume2,
  Target,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import talkingAnimation from "../../assets/animations/talking.json";

import EvaluatingScreen from "./components/EvaluatingScreen";
import SetupProgressBar from "./components/SetupProgressBar";
import RulesStep from "./components/RulesStep";
import AgreementStep from "./components/AgreementStep";
import CameraSetupStep from "./components/CameraSetupStep";
import SuccessScreen from "./components/SuccessScreen";
import { showIntegrityWarningToast } from "../../utils/toastUtils";

const InterviewRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jobRole = location.state?.jobRole || "";

  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Media states
  const [stream, setStream] = useState(null);
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);

  // STT states
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [answers, setAnswers] = useState([]); // Per-question answers array
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [setupStep, setSetupStep] = useState(1); // 1=Rules, 2=Agreement, 3=Camera Setup
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Integrity tracking
  const [violations, setViolations] = useState([]);

  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const lottieRef = useRef(null);
  const deepgramSocketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const isListeningRef = useRef(false);
  const transcriptAccumulatorRef = useRef(""); // Accumulates transcript across recognition restarts

  // Integrity listeners
  const recordViolation = useCallback((type) => {
    if (isSubmitted) return;

    setViolations((prev) => {
      const newViolation = {
        type,
        timestamp: new Date().toISOString(),
        questionIndex: currentQIndex,
      };
      return [...prev, newViolation];
    });

    showIntegrityWarningToast();
  }, [isSubmitted, currentQIndex]);

  useEffect(() => {
    if (!hasStarted || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordViolation("tab-switch");
      }
    };

    const handleBlur = () => {
      recordViolation("window-blur");
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      recordViolation("right-click");
    };

    const handleCopy = (e) => {
      e.preventDefault();
      recordViolation("copy-paste");
    };

    const handlePaste = (e) => {
      e.preventDefault();
      recordViolation("copy-paste");
    };

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        recordViolation("devtools");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasStarted, isSubmitted, recordViolation]);
  // Start listening with Deepgram
  const startListening = useCallback(async () => {
    try {
      if (deepgramSocketRef.current) {
        deepgramSocketRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }

      transcriptAccumulatorRef.current = "";
      setCurrentTranscript("");

      //  Fetch short-lived token from our backend
      const res = await axiosInstance.get("/api/interviews/deepgram-token");
      const token = res.data.token;

      //  Open WebSocket (language=en uses the global english model which perfectly handles all accents)
      const socket = new WebSocket('wss://api.deepgram.com/v1/listen?smart_format=true&interim_results=true&model=nova-2&language=en', [
        'token',
        token
      ]);
      deepgramSocketRef.current = socket;

      socket.onopen = () => {
        isListeningRef.current = true;
        setIsListening(true);

        // Start recording audio and sending chunks
        if (stream) {
          // Extract only the audio track from the webcam stream for Deepgram
          const audioStream = new MediaStream(stream.getAudioTracks());
          const mediaRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0 && socket.readyState === 1) {
              socket.send(event.data);
            }
          });

          mediaRecorder.start(250); // Send chunks every 250ms
        }
      };

      socket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        const transcript = received.channel?.alternatives[0]?.transcript;

        if (transcript) {
          if (received.is_final) {
            transcriptAccumulatorRef.current += transcript + " ";
            setCurrentTranscript(transcriptAccumulatorRef.current);
          } else {
            setCurrentTranscript(transcriptAccumulatorRef.current + transcript);
          }
        }
      };

      socket.onerror = (error) => {
        console.error("Deepgram WebSocket error:", error);
      };

      socket.onclose = () => {
        // Handle reconnects if needed, or cleanup
        if (isListeningRef.current) {
          console.warn("Deepgram socket closed unexpectedly");
        }
      };

    } catch (e) {
      console.error("Deepgram initialization failed:", e);
      toast.error("Speech recognition failed to start.");
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [stream]);

  // Stop listening
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (deepgramSocketRef.current) {
      deepgramSocketRef.current.close();
    }
    mediaRecorderRef.current = null;
    deepgramSocketRef.current = null;
  }, []);

  // Initialize camera for setup preview
  useEffect(() => {
    const initPreview = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        setStream(mediaStream);
        if (previewRef.current) {
          previewRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Failed to get media devices:", err);
        toast.error("Please allow camera and microphone access to continue.");
      }
    };
    if (!hasStarted) {
      initPreview();
    }
  }, [hasStarted]);

  // Bind stream to preview video when Step 3 renders
  useEffect(() => {
    if (setupStep === 3 && stream && previewRef.current) {
      previewRef.current.srcObject = stream;
    }
  }, [setupStep, stream]);

  // Set stream to main video when interview starts
  useEffect(() => {
    if (hasStarted && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [hasStarted, stream]);

  // Cleanup media stream and recognition on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      stopListening();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream, stopListening]);

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  const toggleCam = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCamActive(videoTrack.enabled);
      }
    }
  };

  const handleStart = async () => {
    if (!stream) {
      toast.error("Please allow camera and microphone access first.");
      return;
    }

    try {
      const res = await axiosInstance.get(
        `${API_PATH.INTERVIEW.GET_ALL_QUESTIONS}${jobRole ? `?jobRole=${jobRole}` : ""}`,
      );
      let fetchedQuestions = res.data;

      if (fetchedQuestions.length === 0) {
        return toast.error("No questions found for this role.");
      }

      // Use the category already assigned by the backend (from InterviewRole/InterviewDraft)
      // Valid categories: General, Communication, Technical, Behavioral
      let finalQuestions = fetchedQuestions.map(q => ({
        ...q,
        category: q.category || "General"
      }));

      // Sort alphabetically by category so they are grouped (no shuffling)
      finalQuestions.sort((a, b) => a.category.localeCompare(b.category));

      setQuestions(finalQuestions);
      // Initialize answers array
      setAnswers(finalQuestions.map((q) => ({
        questionId: q._id,
        questionText: q.question || q.questionText,
        idealAnswer: q.idealAnswer || "",
        category: q.category,
        candidateAnswer: "",
      })));
      setHasStarted(true);

      setTimeout(() => {
        const firstCategory = finalQuestions[0].category && finalQuestions[0].category !== 'General'
          ? ` Let's begin with a ${finalQuestions[0].category} question.`
          : " Let's begin with the first question.";
        const displayRole = finalQuestions[0]?.jobRole || jobRole || "General";
        const finalSpokenRole = /^[0-9a-fA-F]{24}$/.test(displayRole) ? "personalized" : displayRole;
        const greeting = `Good day! I am your interviewer for today. We will be conducting a mock interview for the ${finalSpokenRole} position.${firstCategory}`;
        askQuestion(greeting, () => {
          setTimeout(() => {
            askQuestion(finalQuestions[0].question || finalQuestions[0].questionText);
          }, 1000);
        });
      }, 1500);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load questions. Check your backend!");
    }
  };

  const askQuestion = (text, onComplete) => {
    window.speechSynthesis.cancel();
    stopListening();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    const preferredVoices = [
      "Microsoft Guy Online (Natural) - English (United States)",
    ];

    let selectedVoice = null;
    for (let name of preferredVoices) {
      const voice = voices.find((v) => v.name === name);
      if (voice) {
        selectedVoice = voice;
        break;
      }
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(
        (v) => v.lang.startsWith("en-US") || v.lang.startsWith("en-GB"),
      );
    }
    if (!selectedVoice) {
      selectedVoice = voices.find((v) => v.lang.includes("en"));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.pitch = 1.0;
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (lottieRef.current) lottieRef.current.play();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (lottieRef.current) lottieRef.current.pause();
      if (onComplete) {
        onComplete();
      } else {
        // Start STT after speaking
        startListening();
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (lottieRef.current) lottieRef.current.pause();
      if (onComplete) {
        onComplete();
      } else {
        startListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Save current transcript to the answer for the current question
  const saveCurrentAnswer = useCallback(() => {
    const transcript = transcriptAccumulatorRef.current.trim() || currentTranscript.trim();
    stopListening();
    setAnswers((prev) => {
      const updated = [...prev];
      if (updated[currentQIndex]) {
        updated[currentQIndex] = {
          ...updated[currentQIndex],
          candidateAnswer: transcript,
        };
      }
      return updated;
    });
    return transcript;
  }, [currentQIndex, currentTranscript, stopListening]);

  const nextQuestion = () => {
    saveCurrentAnswer();

    if (currentQIndex < questions.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setCurrentTranscript("");
      transcriptAccumulatorRef.current = "";
      setTimeout(() => {
        const nextCategory = questions[nextIdx].category && questions[nextIdx].category !== 'General'
          ? `Moving on to a ${questions[nextIdx].category} question: `
          : "Next question: ";
        askQuestion(`${nextCategory}${questions[nextIdx].question}`);
      }, 500);
    } else {
      handleEndInterview();
    }
  };

  const repeatQuestion = () => {
    askQuestion(questions[currentQIndex].question);
  };

  const handleEndInterview = async () => {
    if (isSubmittingRef.current || isEvaluating || isSubmitted) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // Save the last answer
    const lastTranscript = saveCurrentAnswer();
    window.speechSynthesis.cancel();

    // Build the final answers with the last one included
    const finalAnswers = answers.map((a, idx) => {
      if (idx === currentQIndex) {
        return { ...a, candidateAnswer: lastTranscript || a.candidateAnswer };
      }
      return a;
    });

    // Check if at least some answers were provided
    const answeredCount = finalAnswers.filter((a) => a.candidateAnswer.trim()).length;
    if (answeredCount === 0) {
      toast.error("Please answer at least one question before finishing.");
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    setIsEvaluating(true);

    try {
      const res = await axiosInstance.post(API_PATH.INTERVIEW.EVALUATE, {
        roleName: jobRole || questions[0]?.jobRole || "General",
        answers: finalAnswers,
        violations: violations,
      });

      if (res.data?.status === "rejected") {
        toast.error("Interview failed due to integrity violations.");
      } else {
        toast.success("Interview submitted successfully!");
      }

      window.dispatchEvent(new CustomEvent("openFeedbackModal", {
        detail: { featureName: "Interviews" }
      }));

      setIsSubmitted(true);
      setIsEvaluating(false);
      setIsSubmitting(false);
      isSubmittingRef.current = false;

      // Cleanup
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Evaluation failed:", error);
      toast.error("Failed to submit interview. Please try again.");
      setIsEvaluating(false);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // Check browser support for Speech Recognition
  const hasSpeechRecognition = !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  if (isSubmitted) {
    return <SuccessScreen onDashboard={() => navigate("/assessments")} />;
  }

  if (isEvaluating) {
    return <EvaluatingScreen />;
  }

  if (!hasStarted) {
    return (
      <div className="h-screen flex flex-col bg-slate-50 text-slate-800 overflow-hidden">
        <SetupProgressBar setupStep={setupStep} onBack={() => navigate(-1)} />
        <div className="flex-1 flex overflow-y-auto items-start sm:items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
          <div className="w-full">
            {setupStep === 1 && <RulesStep onNext={() => setSetupStep(2)} />}
            {setupStep === 2 && (
              <AgreementStep
                hasAgreed={hasAgreed}
                setHasAgreed={setHasAgreed}
                onBack={() => setSetupStep(1)}
                onNext={() => setSetupStep(3)}
              />
            )}
            {setupStep === 3 && (
              <CameraSetupStep
                previewRef={previewRef}
                camActive={camActive}
                micActive={micActive}
                stream={stream}
                hasSpeechRecognition={hasSpeechRecognition}
                toggleCam={toggleCam}
                toggleMic={toggleMic}
                onBack={() => setSetupStep(2)}
                onStart={handleStart}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQIndex];

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 text-slate-800 overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row w-full min-h-0">
        {/* AI Interviewer Box */}
        <div className="flex-1 bg-white overflow-hidden relative border-b md:border-b-0 md:border-r border-slate-200 flex flex-col min-h-[45vh] md:min-h-0">
          <div className="relative md:absolute mt-3 mx-3 md:m-0 md:top-6 md:left-6 md:right-6 bg-white/95 backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] z-10 transition-all duration-500 max-h-[40%] overflow-y-auto shrink-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="inline-block bg-blue-500 text-white text-[10px] sm:text-xs font-bold py-0.5 sm:py-1 px-2 sm:px-3 rounded-full uppercase tracking-wider">
                Question {currentQIndex + 1} of {questions.length}
              </div>
              {currentQuestion?.category && (
                <div className="inline-block bg-slate-100 text-slate-600 border border-slate-200 text-[10px] sm:text-xs font-bold py-0.5 sm:py-1 px-2 sm:px-3 rounded-full uppercase tracking-wider">
                  {currentQuestion.category}
                </div>
              )}
            </div>
            <h2 className="text-base sm:text-lg md:text-2xl font-semibold leading-relaxed text-slate-900 m-0">
              "{currentQuestion?.question}"
            </h2>
          </div>

          <div className="flex-1 w-full flex items-center justify-center min-h-0 pb-10 md:pb-0 pt-4 md:pt-0 relative z-0">
            <div className="w-[65%] sm:w-[50%] md:w-full h-full flex items-center justify-center">
              <Lottie
                lottieRef={lottieRef}
                animationData={talkingAnimation}
                loop={true}
                autoplay={false}
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "100%",
                  opacity: isSpeaking ? 1 : 0.8,
                  transition: "opacity 0.3s",
                }}
              />
            </div>
          </div>

          <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 bg-white/85 backdrop-blur-md py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 sm:gap-2 border border-black/5 shadow-sm">
            <div
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isSpeaking ? "bg-emerald-500" : "bg-slate-500"}`}
            />
            AI Interviewer
          </div>
        </div>

        {/* User Camera Box */}
        <div className="flex-1 bg-white overflow-hidden relative flex flex-col items-center justify-center min-h-[40vh] md:min-h-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />

          {!camActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <VideoOff className="w-10 h-10 sm:w-16 sm:h-16 text-slate-400" />
            </div>
          )}

          {/* Live Transcript Overlay */}
          <div className="absolute bottom-16 sm:bottom-20 left-3 right-3 sm:left-4 sm:right-4 z-10">
            {(isListening || currentTranscript) && (
              <div className="bg-black/70 backdrop-blur-md text-white p-3 sm:p-4 rounded-xl max-h-24 sm:max-h-32 overflow-y-auto">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  {isListening && (
                    <>
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] sm:text-xs font-semibold text-red-300 uppercase tracking-wider">
                        Listening...
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {currentTranscript || (
                    <span className="text-white/50 italic">
                      Start speaking your answer...
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 bg-white/85 backdrop-blur-md py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 sm:gap-2 border border-black/5 shadow-sm">
            <div
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${micActive ? "bg-emerald-500" : "bg-red-500"}`}
            />
            You
          </div>

          {!micActive && (
            <div className="absolute top-3 sm:top-5 right-3 sm:right-5 bg-red-500/90 p-1.5 sm:p-2 rounded-full">
              <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="shrink-0 bg-white flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-4 p-2 sm:p-4 border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-20">
        <div className="flex justify-center gap-2 sm:gap-4">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${micActive
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:-translate-y-0.5"
                : "bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5"
              }`}
          >
            {micActive ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          <button
            onClick={toggleCam}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${camActive
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:-translate-y-0.5"
                : "bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5"
              }`}
          >
            {camActive ? <VideoIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>

        <div className="flex-1 flex justify-center w-full sm:w-auto gap-2 sm:gap-4 mt-1 sm:mt-0">
          <button
            onClick={repeatQuestion}
            className="flex-1 sm:flex-none justify-center px-3 sm:px-6 h-12 sm:h-14 rounded-full flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-base transition-all duration-200 cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 hover:-translate-y-0.5 border-none"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Repeat</span>
            <span className="sm:hidden">Repeat</span>
          </button>

          <button
            onClick={handleEndInterview}
            disabled={isSubmitting || isEvaluating}
            className="flex-none px-3 sm:px-6 h-12 sm:h-14 rounded-full flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-base transition-all duration-200 cursor-pointer bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 border-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
            {isSubmitting ? <span className="hidden sm:inline">Ending...</span> : "End"}
          </button>

          <button
            onClick={nextQuestion}
            disabled={isSubmitting || isEvaluating}
            className="flex-1 sm:flex-none justify-center px-4 sm:px-6 h-12 sm:h-14 rounded-full flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-base transition-all duration-200 cursor-pointer bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 border-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {currentQIndex === questions.length - 1 ? (
              isSubmitting ? (
                <>
                  <span className="hidden sm:inline">Finishing</span> <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                </>
              ) : (
                <>
                  Finish <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )
            ) : (
              <>
                Next <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
