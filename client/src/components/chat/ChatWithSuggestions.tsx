import { useTranslation } from "react-i18next";
import { Chat } from "@/components/chat/Chat";
import { useChatApi } from "@/hooks/chatBot/useChatApi";

export function ChatWithSuggestions() {
  const { t } = useTranslation();
  const {
    messages,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    append,
    stop,
  } = useChatApi();

  return (
    <Chat
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isGenerating={isLoading}
      stop={stop}
      append={append}
      suggestions={[
        t("chat.suggestions.createTask"),
        t("chat.suggestions.shareList"),
        t("chat.suggestions.notifications"),
      ]}
    />
  );
}
