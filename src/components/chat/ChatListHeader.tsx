"use client";
import { ChangeEvent } from 'react';
import { useChatContext } from '@/contexts/ChatContext';

export function ChatListHeader() {
  const { setSearchQuery } = useChatContext();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="p-4 border-b border-border/50">
      <input
        type="text"
        placeholder="Search chats..."
        onChange={handleSearch}
        className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
