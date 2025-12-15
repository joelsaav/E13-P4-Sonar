import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Message } from "@/components/chat/ChatMessage";

interface UseChatApiOptions {
  apiUrl?: string;
  onError?: (error: Error) => void;
}

interface UseChatApiReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  setInput: (value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e?: { preventDefault?: () => void }) => Promise<void>;
  append: (message: { role: "user"; content: string }) => Promise<void>;
  stop: () => void;
  setMessages: (messages: Message[]) => void;
}

export function useChatApi(options: UseChatApiOptions = {}): UseChatApiReturn {
  const { t } = useTranslation();
  const { apiUrl = `${import.meta.env.VITE_API_BASE_URL || "/api"}/chat` } =
    options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  const processStreamResponse = useCallback(
    async (
      response: Response,
      botMessage: Message,
      currentMessages: Message[],
    ) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      setMessages([...currentMessages, botMessage]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                botMessage.content += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMessage.id ? { ...botMessage } : m,
                  ),
                );
              }
            } catch (e) {
              if (import.meta.env.DEV) {
                console.error("Error parsing chunk:", e);
              }
            }
          }
        }
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (userMessage: Message, currentMessages: Message[]) => {
      abortControllerRef.current = new AbortController();

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...currentMessages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      await processStreamResponse(response, botMessage, [
        ...currentMessages,
        userMessage,
      ]);
    },
    [apiUrl, processStreamResponse],
  );

  const handleSubmit = useCallback(
    async (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();

      if (!input.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
      };

      const currentMessages = [...messages];
      setMessages([...currentMessages, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        await sendMessage(userMessage, currentMessages);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          if (import.meta.env.DEV) {
            console.error("Error:", error);
          }
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: t("chat.botResponse"),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, sendMessage, t],
  );

  const append = useCallback(
    async (message: { role: "user"; content: string }) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: message.role,
        content: message.content,
      };

      const currentMessages = [...messages];
      setMessages([...currentMessages, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        await sendMessage(userMessage, currentMessages);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          if (import.meta.env.DEV) {
            console.error("Error:", error);
          }
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: t("chat.botResponse"),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messages, sendMessage, t],
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  return {
    messages,
    input,
    isLoading,
    setInput,
    handleInputChange,
    handleSubmit,
    append,
    stop,
    setMessages,
  };
}
