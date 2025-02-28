"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { ChatData } from "@/types";

interface ChatContextType {
  chats: ChatData[];
  currentChat: ChatData | null;
  setCurrentChat: (chat: ChatData) => void;
  createChat: () => Promise<void>;
  updateChat: (id: string, updates: Partial<ChatData>) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentChat, setCurrentChat] = useState<ChatData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, isSignedIn } = useUser();
  const { openSignUp } = useClerk();

  // Fetch chats when user signs in
  useEffect(() => {
    if (isSignedIn) {
      fetchChats();
    } else {
      setChats([]);
      setCurrentChat(null);
      setIsLoading(false);
    }
  }, [isSignedIn]);

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chats");
      if (!response.ok) throw new Error("Failed to fetch chats");

      const data = await response.json();

      // If user has no chats, create one
      if (data.length === 0) {
        await createChat();
        return; // createChat will set the state
      }

      setChats(data);

      // Set current chat to the first one if none is selected
      if (data.length > 0 && !currentChat) {
        setCurrentChat(data[0]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setIsLoading(false);
    }
  };

  const createChat = async () => {
    if (!user) {
      openSignUp();
      return;
    }

    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });

      if (!response.ok) throw new Error("Failed to create chat");

      const newChat = await response.json();
      setChats((prev) => [newChat, ...prev]);
      setCurrentChat(newChat);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create new chat");
    }
  };

  const updateChat = async (id: string, updates: Partial<ChatData>) => {
    if (!isSignedIn) return;

    try {
      setChats((prev) =>
        prev.map((chat) => (chat.id === id ? { ...chat, ...updates } : chat))
      );

      if (currentChat?.id === id) {
        setCurrentChat((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } catch (error) {
      console.error("Error updating chat:", error);
      toast.error("Failed to update chat");
    }
  };

  const deleteChat = async (id: string) => {
    if (!isSignedIn) return;

    try {
      // Delete the chat
      const response = await fetch(`/api/chats/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete chat");

      // Remove the deleted chat from state
      setChats((prev) => prev.filter((chat) => chat.id !== id));

      // If we just deleted the current chat or the last chat
      if (currentChat?.id === id || chats.length <= 1) {
        // Create a new chat if we deleted the last one
        if (chats.length <= 1) {
          await createChat();
        } else {
          // Otherwise select another existing chat
          const remainingChats = chats.filter((chat) => chat.id !== id);
          setCurrentChat(remainingChats[0]);
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats: chats.filter((chat) =>
          chat.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        currentChat,
        setCurrentChat,
        createChat,
        updateChat,
        deleteChat,
        searchQuery,
        setSearchQuery,
        isLoading,
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
