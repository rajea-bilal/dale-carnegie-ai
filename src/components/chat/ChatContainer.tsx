"use client";

import { useChat } from "@ai-sdk/react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Message } from "@/types";
import { useEffect, useState } from "react";
import { ChatCard } from "./ChatCard";
import { useChatContext } from "@/contexts/ChatContext";
import { useUser, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";
import isEqual from "lodash/isEqual";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello friend! I'm Dale Carnegie, and I'm delighted to meet you. My passion is helping people like you build wonderful relationships and achieve their dreams through simple, heartfelt principles. What's on your mind? Let's talk",
};

export function ChatContainer() {
  const { user } = useUser();
  const [statusMessage, setStatusMessage] = useState<string>();
  const { currentChat, updateChat } = useChatContext();
  const { openSignUp } = useClerk();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    reload,
    setMessages,
  } = useChat({
    api: "/api/chat",
    onResponse: (response: Response) => {
      if (!response.ok || !currentChat) return;
      const headers = response.headers;
      const chatTitle = headers.get("X-Chat-Title");
      if (chatTitle) {
        updateChat(currentChat?.id, { title: chatTitle });
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("Daily Token Limit Reached")) {
        toast.error("Daily message limit reached. Please try again tomorrow.", {
          duration: 4000,
          position: "top-center",
        });
      } else {
        toast.error("Something went wrong. Please try again.", {
          duration: 4000,
          position: "top-center",
        });
      }
      setStatusMessage(undefined);
    },
    onFinish: () => {
      setStatusMessage(undefined);
    },
    initialMessages: currentChat?.messages,
    body: {
      chatId: currentChat?.id,
    },
  });

  useEffect(() => {
    if (!currentChat) return;
    if (isEqual(messages, currentChat.messages)) return;

    updateChat(currentChat.id, {
      messages,
    });
  }, [messages]);

  // Handle status messages from the stream
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      (lastMessage?.role === "assistant" && !lastMessage.content) ||
      (isLoading && !lastMessage?.content)
    ) {
      setStatusMessage("AI is thinking...");
    }
  }, [messages]);

  // Set the messages to the current chat messages when the chat is changed
  useEffect(() => {
    setMessages(currentChat?.messages ?? []);
  }, [currentChat?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openSignUp();
      return;
    }
    originalHandleSubmit(e);
  };

  return (
    <ChatCard className="flex flex-col flex-grow min-h-0 overflow-hidden">
      <div className="flex flex-col flex-grow min-h-0">
        <MessageList messages={currentChat?.messages} />
        {/* <MessageList messages={messages} /> */}
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
