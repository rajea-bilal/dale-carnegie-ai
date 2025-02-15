"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp?: string;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: string | undefined;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectChat: (id: string) => void;
  createNewChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats] = useState<Chat[]>([
    {
      id: "1",
      title: "Chat 1",
      lastMessage: "Hello",
      timestamp: "2m ago",
    },
    {
      id: "2",
      title: "Chat 2",
      lastMessage: "Hi there",
      timestamp: "5m ago",
    },
  ]);
  
  const [activeChat, setActiveChat] = useState<string>();
  const [searchQuery, setSearchQuery] = useState("");

  const selectChat = (id: string) => {
    setActiveChat(id);
  };

  const createNewChat = () => {
    // Implementation for creating new chat
    console.log("Creating new chat");
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        searchQuery,
        setSearchQuery,
        selectChat,
        createNewChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
