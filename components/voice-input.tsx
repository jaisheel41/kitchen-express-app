"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
}

export function VoiceInput({
  onTranscript,
  onError,
  disabled = false,
  className,
  size = "icon",
  variant = "outline",
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      if (onError) {
        onError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      }
      return;
    }

    setIsSupported(true);

    // Initialize recognition
    const recognition = new SpeechRecognition() as SpeechRecognition;
    recognition.lang = "en-IN"; // Indian English
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      finalTranscriptRef.current = "";
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript.trim();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      let errorMessage = "Speech recognition error occurred.";

      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage = "No microphone found. Please check your microphone.";
          break;
        case "not-allowed":
          errorMessage = "Microphone permission denied. Please allow microphone access.";
          break;
        case "network":
          errorMessage = "Network error. Please check your connection.";
          break;
        case "aborted":
          // User stopped manually, not an error
          return;
        default:
          errorMessage = `Recognition error: ${event.error}`;
      }

      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscriptRef.current) {
        onTranscript(finalTranscriptRef.current);
        finalTranscriptRef.current = "";
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    };
  }, [onTranscript, onError]);

  const startListening = () => {
    if (!isSupported || disabled || !recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      setError("Failed to start speech recognition. Please try again.");
      if (onError) {
        onError("Failed to start speech recognition.");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors
      }
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={isListening ? stopListening : startListening}
        disabled={disabled || !isSupported}
        className={cn(
          "transition-all min-h-[44px] min-w-[44px]", // Mobile touch target
          isListening && "bg-primary text-primary-foreground animate-pulse",
          size === "lg" && "w-full"
        )}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
      >
        {isListening ? (
          <>
            <Square className="h-4 w-4" />
            <span className={cn("ml-2", size === "lg" ? "inline" : "hidden sm:inline")}>
              Stop Listening
            </span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            <span className={cn("ml-2", size === "lg" ? "inline" : "hidden sm:inline")}>
              {size === "lg" ? "Speak Items" : "Voice"}
            </span>
          </>
        )}
      </Button>
      {isListening && (
        <div className="absolute top-full left-0 mt-2 text-xs text-muted-foreground whitespace-nowrap z-10 bg-background px-2 py-1 rounded border shadow-sm">
          🎤 Listening...
        </div>
      )}
      {error && (
        <div className="absolute top-full left-0 mt-2 text-xs text-destructive whitespace-normal max-w-[250px] z-10 bg-destructive/10 px-2 py-1 rounded border border-destructive/20">
          {error}
        </div>
      )}
    </div>
  );
}

