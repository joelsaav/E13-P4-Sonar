import { memo } from "react";
import { useTypewriter } from "@/hooks/ui/useTypewriter";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p";
  showCursor?: boolean;
  cursorChar?: string;
  onComplete?: () => void;
}

export const Typewriter = memo(function Typewriter({
  text,
  speed = 40,
  delay = 100,
  className,
  as: Tag = "h1",
  showCursor = true,
  cursorChar = "|",
  onComplete,
}: TypewriterProps) {
  const { displayText } = useTypewriter({
    text,
    speed,
    delay,
    onComplete,
  });

  return (
    <Tag className={cn(className)}>
      {displayText}
      {showCursor && (
        <span
          className="inline-block font-light animate-blink"
          aria-hidden="true"
        >
          {cursorChar}
        </span>
      )}
    </Tag>
  );
});
