"use client";
import { Card } from "@/components/ui/card";

interface ChatListItemProps {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function ChatListItem({ 
  title, 
  lastMessage, 
  timestamp, 
  isActive,
  onClick 
}: ChatListItemProps) {
  return (
    <Card
      className={`p-3 mb-2 cursor-pointer hover:bg-background/90 transition-colors
        ${isActive ? 'bg-background/90 border-border/50' : 'bg-background/50 border-background/20'}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm">{title}</h3>
          {lastMessage && (
            <p className="text-xs text-muted-foreground truncate">{lastMessage}</p>
          )}
        </div>
        {timestamp && (
          <span className="text-[10px] text-muted-foreground">{timestamp}</span>
        )}
      </div>
    </Card>
  );
}
