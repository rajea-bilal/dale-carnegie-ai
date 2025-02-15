"use client";

import { useChat } from "@ai-sdk/react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Message } from "@/types";
import { useEffect, useState } from "react";
import { ChatCard } from "./ChatCard";
import { useChatContext } from "@/contexts/ChatContext";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello friend! I'm Dale Carnegie, and I'm delighted to meet you. My passion is helping people like you build wonderful relationships and achieve their dreams through simple, heartfelt principles. What's on your mind? Let's talk",
};

export function ChatContainer() {
  const [statusMessage, setStatusMessage] = useState<string>();
  const { currentChat, updateChat } = useChatContext();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    setMessages,
  } = useChat({
    api: "/api/chat",
    onResponse: (response: Response) => {
      if (response.ok) {
        console.log("Response started");
      }
    },
    onFinish: (message: Message) => {
      setStatusMessage(undefined);
      console.log("Response finished", message);
      // Update the current chat in context when messages change
      if (currentChat) {
        updateChat(currentChat.id, {
          messages: [...messages, message],
          updatedAt: new Date().toISOString(),
        });
      }
    },
  });

  // // Initialize messages from current chat when it changes
  // useEffect(() => {
  //   if (currentChat?.messages && currentChat.messages.length > 0) {
  //     setMessages(currentChat.messages)
  //   } else {
  //     // If this is a new chat, update it with the welcome message
  //     if (currentChat && currentChat.messages.length === 0) {
  //       updateChat(currentChat.id, {
  //         messages: [WELCOME_MESSAGE],
  //         updatedAt: new Date().toISOString()
  //       })
  //     }
  //   }
  // }, [currentChat])

  // Handle status messages from the stream
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && !lastMessage.content) {
      setStatusMessage("AI is thinking...");
    }
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
    setStatusMessage(undefined);
  };

  return (
    <ChatCard messages={messages} onClearChat={handleClearChat}>
      <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
        <MessageList messages={messages} />
      </div>
      <div className="p-4 border-t">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </ChatCard>
  );
}
