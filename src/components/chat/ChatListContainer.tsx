"use client";
import { useState } from "react";
import { ChatListHeader } from "./ChatListHeader";
import { ChatList } from "./ChatList";
import { ChatListFooter } from "./ChatListFooter";
import { useChatContext } from "@/contexts/ChatContext";
import { AnimatedCard, Card } from "@/components/ui/card";
import { motion } from "motion/react";

interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp?: string;
}

export function ChatListContainer() {
  const { chats, searchQuery, activeChat } = useChatContext();

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatedCard className="w-[350px] flex flex-col bg-background/80 backdrop-blur-sm border-background/20 shadow-xl">
      {/* <ChatListHeader />
      <ChatList chats={filteredChats} />
      <ChatListFooter /> */}
    </AnimatedCard>
  );
}
