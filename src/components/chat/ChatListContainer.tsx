"use client";
import { useState } from "react";
import { ChatListFooter } from "./ChatListFooter";
import { useChatContext } from "@/contexts/ChatContext";
import { AnimatedCard, Card } from "@/components/ui/card";
import { motion } from "motion/react";
import ChatListHeader from "./ChatListHeader";
import ChatList from "./ChatList";

interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp?: string;
}

export function ChatListContainer() {
  const { chats } = useChatContext();

  return (
    <AnimatedCard className="w-full h-full flex flex-col bg-background/80 backdrop-blur-sm border-background/20 shadow-xl">
      <ChatListHeader />
      <div className="flex-1 min-h-0">
        <ChatList chats={chats} />
      </div>
      <ChatListFooter />
    </AnimatedCard>
  );
}
