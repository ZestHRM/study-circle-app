import * as Speech from "expo-speech";
import * as React from "react";

export interface UseAIVoiceOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  initialMuted?: boolean;
}

export function useAIVoice(options: UseAIVoiceOptions = {}) {
  const {
    language = "en",
    pitch = 1.0,
    rate = 0.95,
    initialMuted = false,
  } = options;

  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(initialMuted);

  const stop = React.useCallback(() => {
    try {
      Speech.stop();
    } catch {
      // Ignore Speech cleanup errors
    }
    setIsSpeaking(false);
  }, []);

  const speak = React.useCallback(
    (textToSpeak: string, onFinish?: () => void) => {
      if (isMuted || !textToSpeak) {
        setIsSpeaking(false);
        onFinish?.();
        return;
      }

      try {
        Speech.stop();
        setIsSpeaking(true);
        Speech.speak(textToSpeak, {
          language,
          pitch,
          rate,
          onStart: () => setIsSpeaking(true),
          onDone: () => {
            setIsSpeaking(false);
            onFinish?.();
          },
          onError: () => {
            setIsSpeaking(false);
            onFinish?.();
          },
          onStopped: () => {
            setIsSpeaking(false);
          },
        });
      } catch {
        setIsSpeaking(false);
        onFinish?.();
      }
    },
    [isMuted, language, pitch, rate]
  );

  const toggleMute = React.useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stop();
      }
      return next;
    });
  }, [stop]);

  // Clean up audio on unmount
  React.useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isMuted,
    setIsMuted,
    toggleMute,
  };
}
