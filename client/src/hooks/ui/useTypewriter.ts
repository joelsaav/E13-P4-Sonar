import { useState, useEffect, useCallback } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

interface UseTypewriterReturn {
  displayText: string;
  isTyping: boolean;
  isComplete: boolean;
  restart: () => void;
}

export function useTypewriter({
  text,
  speed = 50,
  delay = 0,
  onComplete,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const restart = useCallback(() => {
    setDisplayText("");
    setCurrentIndex(0);
    setIsComplete(false);
    setHasStarted(false);
    setIsTyping(false);
  }, []);

  useEffect(() => {
    if (hasStarted) return;

    const startTimeout = setTimeout(() => {
      setHasStarted(true);
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay, hasStarted]);

  useEffect(() => {
    if (!hasStarted || isComplete) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, hasStarted, isComplete, onComplete, speed, text]);

  useEffect(() => {
    restart();
  }, [text, restart]);

  return {
    displayText,
    isTyping,
    isComplete,
    restart,
  };
}
