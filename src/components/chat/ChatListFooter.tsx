"use client";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/contexts/ChatContext";
import { Plus } from "lucide-react";

interface ChatListFooterProps {}

export function ChatListFooter() {
  const { createNewChat } = useChatContext();

  return (
    <div className="p-4 border-t border-border/50">
      <Button 
        onClick={createNewChat}
        className="w-full flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </Button>
    </div>
  );
}
