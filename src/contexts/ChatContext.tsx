"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ChatStorage, ChatData } from '../utils/Storage';

interface ChatContextType {
  chats: ChatData[];
  currentChat: ChatData | null;
  setCurrentChat: (chat: ChatData) => void;
  createChat: () => void;
  updateChat: (id: string, updates: Partial<ChatData>) => void;
  deleteChat: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  updateChatMessages: (id: string, messages: any[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentChat, setCurrentChat] = useState<ChatData | null>(null);

  useEffect(() => {
    // Initialize storage and load chats
    ChatStorage.initialize();
    const loadedChats = ChatStorage.getAllChats();
    console.log(loadedChats)
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
    ChatStorage.createChat(newChat);
    setChats(ChatStorage.getAllChats());
    setCurrentChat(newChat);
  };

  const updateChat = (id: string, updates: Partial<ChatData>) => {
    ChatStorage.updateChat(id, updates);
    setChats(ChatStorage.getAllChats());
    if (currentChat?.id === id) {
      setCurrentChat({ ...currentChat, ...updates });
    }
  };

  const updateChatMessages = (id: string, messages: any[]) => {
    ChatStorage.updateChat(id, { messages });
  };

  const deleteChat = (id: string) => {
    ChatStorage.deleteChat(id);
    const updatedChats = ChatStorage.getAllChats();
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
        updateChatMessages,
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
