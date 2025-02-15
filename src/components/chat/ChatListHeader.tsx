"use client";
import React from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { Search } from "lucide-react";

const ChatListHeader: React.FC = () => {
  const { searchQuery, setSearchQuery } = useChatContext();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="p-4 border-b border-border/50">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default ChatListHeader;
