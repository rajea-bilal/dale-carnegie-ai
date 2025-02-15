"use client";
import React from 'react';
import { useChatContext } from "@/contexts/ChatContext";
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatListFooterProps {}

export function ChatListFooter() {
  const { chats, createChat } = useChatContext();

  return (
    <div className="p-4 border-t border-border/50">
      <Button 
        onClick={createChat}
        className="w-full flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </Button>
    </div>
  );
}
