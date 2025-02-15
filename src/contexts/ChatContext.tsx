"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Storage, ChatData } from '../utils/Storage';

interface ChatContextType {
  chats: ChatData[];
  currentChat: ChatData | null;
  setCurrentChat: (chat: ChatData) => void;
  createChat: () => void;
  updateChat: (id: string, updates: Partial<ChatData>) => void;
  deleteChat: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentChat, setCurrentChat] = useState<ChatData | null>(null);

  useEffect(() => {
    // Initialize storage and load chats
    Storage.initialize();
    const loadedChats = Storage.getAllChats();
    setChats(loadedChats);
    setCurrentChat(loadedChats[0]);
  }, []);

  const createChat = () => {
    const now = new Date().toISOString();
    const newChat: ChatData = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: now,
      updatedAt: now
    };
    Storage.createChat(newChat);
    setChats(Storage.getAllChats());
    setCurrentChat(newChat);
  };

  const updateChat = (id: string, updates: Partial<ChatData>) => {
    Storage.updateChat(id, updates);
    setChats(Storage.getAllChats());
    if (currentChat?.id === id) {
      setCurrentChat({ ...currentChat, ...updates });
    }
  };

  const deleteChat = (id: string) => {
    Storage.deleteChat(id);
    const updatedChats = Storage.getAllChats();
    setChats(updatedChats);
    if (currentChat?.id === id) {
      setCurrentChat(updatedChats[0]);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats: chats.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase())),
        currentChat,
        setCurrentChat,
        createChat,
        updateChat,
        deleteChat,
        searchQuery,
        setSearchQuery,
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
