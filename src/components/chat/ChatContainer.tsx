"use client";

import { useChat } from "@ai-sdk/react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Message } from "@/types";
import { useEffect, useState, useCallback, useRef } from "react";
import { ChatCard } from "./ChatCard";
import { useChatContext } from "@/contexts/ChatContext";
import { useUser, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello friend! I'm Dale Carnegie, and I'm delighted to meet you. My passion is helping people like you build wonderful relationships and achieve their dreams through simple, heartfelt principles. What's on your mind? Let's talk",
};

export function ChatContainer() {
  const { user } = useUser();
  const [statusMessage, setStatusMessage] = useState<string>();
  const { currentChat, updateChatMessages } = useChatContext();
  const { openSignUp } = useClerk();
  const needsSavingRef = useRef(false);


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
      if (response.ok) {
        console.log("Response started");
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
  });

  // Update the chat messages when they change
  useEffect(() => {
    if (!currentChat) return;

    // Only update context immediately for UI updates
    if (messages.length > 0 &&
      JSON.stringify(messages) !== JSON.stringify(currentChat.messages)) {

      // Update the UI context
      updateChatMessages(currentChat.id, messages);

      // Mark that we need to save once loading is complete
      if (isLoading) {
        needsSavingRef.current = true;
      }
    }
  }, [messages, updateChatMessages, isLoading]);

  // Separate effect to handle saving when loading completes
  useEffect(() => {
    // When loading finishes and we have pending saves
    if (!isLoading && needsSavingRef.current && currentChat) {
      console.log("Stream completed, saving messages to database");
      saveMessages(messages);
      needsSavingRef.current = false;
    }
  }, [isLoading, messages, currentChat]);

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

  const handleClearChat = () => {
    setMessages([]);
    setStatusMessage(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openSignUp();
      return;
    }
    originalHandleSubmit(e);
  };

  // Add this function to save messages when they change
  const saveMessages = useCallback(
    async (messagesToSave: Message[]) => {
      if (!currentChat || messagesToSave.length === 0) return;

      try {
        console.log("Saving messages to database:", messagesToSave.length);

        // Save messages to database
        await fetch(`/api/chats/${currentChat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: {
              messages: messagesToSave,
              updatedAt: new Date().toISOString()
            }
          })
        });
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    },
    [currentChat]
  );

  return (
    <ChatCard
      className="flex flex-col flex-grow min-h-0 overflow-hidden"
      messages={messages}
      onClearChat={handleClearChat}
    >
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
