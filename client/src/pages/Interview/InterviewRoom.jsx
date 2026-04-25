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

  // Pre-interview setup states
  const [setupStep, setSetupStep] = useState(1); // 1=Rules, 2=Agreement, 3=Camera Setup
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const lottieRef = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const transcriptAccumulatorRef = useRef(""); // Accumulates transcript across recognition restarts

  // Initialize Speech Recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalTranscript = transcriptAccumulatorRef.current;
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
          transcriptAccumulatorRef.current = finalTranscript;
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we're still in "listening" mode via Ref check
      if (isListeningRef.current) {
        setTimeout(() => {
          try {
            if (isListeningRef.current) {
              recognition.start();
            }
          } catch (e) {
            // Safe to ignore
          }
        }, 300);
      }
    };

    return recognition;
  }, []); // Dependencies empty because we use Refs for changing values

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { /* ignore */ }
    }

    transcriptAccumulatorRef.current = "";
    setCurrentTranscript("");

    const recognition = initSpeechRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      try {
        isListeningRef.current = true;
        setIsListening(true);
        recognition.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
        isListeningRef.current = false;
        setIsListening(false);
      }
    }
  }, [initSpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }
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

      const shuffled = fetchedQuestions.sort(() => 0.5 - Math.random());
      setQuestions(shuffled);
      // Initialize answers array
      setAnswers(shuffled.map((q) => ({
        questionId: q._id,
        questionText: q.question,
        idealAnswer: q.idealAnswer || "",
        candidateAnswer: "",
      })));
      setHasStarted(true);

      setTimeout(() => {
        const greeting = `Good day! I am your interviewer for today. We will be conducting a mock interview for the ${jobRole || "General"} position. Let's begin with the first question.`;
        askQuestion(greeting, () => {
          setTimeout(() => {
            askQuestion(shuffled[0].question);
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
    stopListening(); // Stop STT while AI is asking

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
        // Start STT after AI finishes speaking
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
        askQuestion(questions[nextIdx].question);
      }, 500);
    } else {
      handleEndInterview();
    }
  };

  const repeatQuestion = () => {
    askQuestion(questions[currentQIndex].question);
  };

  const handleEndInterview = async () => {
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
      return;
    }

    setIsEvaluating(true);

    try {
      await axiosInstance.post(API_PATH.INTERVIEW.EVALUATE, {
        roleName: jobRole || questions[0]?.jobRole || "General",
        answers: finalAnswers,
      });

      toast.success("Interview submitted successfully!");
      setIsSubmitted(true);
      setIsEvaluating(false);

      // Cleanup
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Evaluation failed:", error);
      toast.error("Failed to submit interview. Please try again.");
      setIsEvaluating(false);
    }
  };

  // Check browser support for Speech Recognition
  const hasSpeechRecognition = !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  if (isSubmitted) {
    return <SuccessScreen onDashboard={() => navigate("/skill-center")} />;
  }

  if (isEvaluating) {
    return <EvaluatingScreen />;
  }

  if (!hasStarted) {
    return (
      <div className="h-screen flex flex-col bg-slate-50 text-slate-800 overflow-hidden">
        <SetupProgressBar setupStep={setupStep} onBack={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center p-6">
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
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 overflow-hidden">
      <div className="flex-1 flex w-full h-[calc(100vh-100px)]">
        <div className="flex-1 flex w-full">
          {/* AI Interviewer Box */}
          <div className="flex-1 bg-white overflow-hidden relative border-r border-slate-200 flex flex-col items-center justify-center">
            <div className="absolute top-6 left-6 right-6 bg-white/95 backdrop-blur-xl p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] z-10 transition-all duration-500 translate-y-0 opacity-100">
              <div className="inline-block bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-full mb-3 uppercase tracking-wider">
                Question {currentQIndex + 1} of {questions.length}
              </div>
              <h2 className="text-2xl font-semibold leading-relaxed text-slate-900 m-0">
                "{currentQuestion?.question}"
              </h2>
            </div>

            <Lottie
              lottieRef={lottieRef}
              animationData={talkingAnimation}
              loop={true}
              autoplay={false}
              style={{
                width: "90%",
                height: "90%",
                maxHeight: 600,
                opacity: isSpeaking ? 1 : 0.8,
                transition: "opacity 0.3s",
              }}
            />

            <div className="absolute bottom-5 left-5 bg-white/85 backdrop-blur-md py-2 px-4 rounded-lg font-semibold text-sm text-slate-900 flex items-center gap-2 border border-black/5 shadow-sm">
              <div
                className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-emerald-500" : "bg-slate-500"}`}
              />
              AI Interviewer
            </div>
          </div>

          {/* User Camera Box */}
          <div className="flex-1 bg-white overflow-hidden relative flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />

            {!camActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <VideoOff size={64} className="text-slate-400" />
              </div>
            )}

            {/* Live Transcript Overlay */}
            <div className="absolute bottom-20 left-4 right-4 z-10">
              {(isListening || currentTranscript) && (
                <div className="bg-black/70 backdrop-blur-md text-white p-4 rounded-xl max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2">
                    {isListening && (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">
                          Listening...
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">
                    {currentTranscript || (
                      <span className="text-white/50 italic">
                        Start speaking your answer...
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="absolute bottom-5 left-5 bg-white/85 backdrop-blur-md py-2 px-4 rounded-lg font-semibold text-sm text-slate-900 flex items-center gap-2 border border-black/5 shadow-sm">
              <div
                className={`w-2 h-2 rounded-full ${micActive ? "bg-emerald-500" : "bg-red-500"}`}
              />
              You
            </div>

            {!micActive && (
              <div className="absolute top-5 right-5 bg-red-500/90 p-2 rounded-full">
                <MicOff size={20} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="h-[100px] bg-white flex items-center justify-center gap-4 px-8 border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <button
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            micActive
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:-translate-y-0.5"
              : "bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5"
          }`}
        >
          {micActive ? <Mic /> : <MicOff />}
        </button>

        <button
          onClick={toggleCam}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            camActive
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:-translate-y-0.5"
              : "bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5"
          }`}
        >
          {camActive ? <VideoIcon /> : <VideoOff />}
        </button>

        <div className="flex-1 flex justify-center gap-4">
          <button
            onClick={repeatQuestion}
            className="px-6 h-14 rounded-full flex items-center gap-2 font-semibold text-base transition-all duration-200 cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 hover:-translate-y-0.5 border-none"
          >
            <RefreshCw size={20} />
            Repeat Question
          </button>

          <button
            onClick={nextQuestion}
            className="px-6 h-14 rounded-full flex items-center gap-2 font-semibold text-base transition-all duration-200 cursor-pointer bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 border-none"
          >
            {currentQIndex === questions.length - 1 ? (
              <>
                Finish <Check size={20} />
              </>
            ) : (
              <>
                Next <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>

        <button
          onClick={handleEndInterview}
          className="px-6 h-14 rounded-full flex items-center gap-2 font-semibold text-base transition-all duration-200 cursor-pointer bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 border-none"
        >
          <PhoneOff size={20} />
          End
        </button>
      </div>
    </div>
  );
};

export default InterviewRoom;
