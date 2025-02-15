"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatListItem } from "./ChatListItem";
import { useChatContext } from "@/contexts/ChatContext";

interface ChatListProps {
  chats: Array<{
    id: string;
    title: string;
    lastMessage?: string;
    timestamp?: string;
  }>;
}

export function ChatList({ chats }: ChatListProps) {
  const { activeChat, selectChat } = useChatContext();

  return (
    <ScrollArea className="flex-1">
      <div className="p-4">
        <span className="text-gray-900 font-medium text-sm">Chats</span>
        <div  className="mb-1" />
        {chats.map((chat, index) => (
          <ChatListItem
            key={chat.id}
            {...chat}
            isActive={activeChat === chat.id}
            onClick={() => selectChat(chat.id)}
            index={index}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
