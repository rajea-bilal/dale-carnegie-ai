"use client";
import React, { memo } from 'react';
import { AnimatedCard } from "@/components/ui/card";
import { TrashIcon } from 'lucide-react';
import { ChatData } from '@/types';

interface ChatListItemProps {
  chat: ChatData;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  index: number;
}

// Use memo to prevent unnecessary re-renders
export const ChatListItem = memo(function ChatListItem({
  chat,
  isActive,
  onClick,
  onDelete,
  index,
}: ChatListItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <AnimatedCard
      variant="Rotate"
      delay={(index * 150) - (50 * index) + 300}
      className={`p-3 mb-2 cursor-pointer hover:bg-background/90 transition-colors shrink-0
        ${isActive
          ? "bg-background/90 border-border/50"
          : "bg-background/50 border-background/20"
        }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-sm">{chat.title}</h3>
          <p className="text-xs text-muted-foreground">
            {new Date(chat.updatedAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          <TrashIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </AnimatedCard>
  );
});
