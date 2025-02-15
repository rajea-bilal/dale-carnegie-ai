import React from "react";
import { useChatContext } from "@/contexts/ChatContext";
import ChatListHeader from "./ChatListHeader";
import { ChatListItem } from "./ChatListItem";
import { ChatListFooter } from "./ChatListFooter";

interface ChatListProps {
  chats: Array<{
    id: string;
    title: string;
    lastMessage?: string;
    timestamp?: string;
  }>;
}

const ChatList: React.FC<ChatListProps> = () => {
  const { chats, currentChat, setCurrentChat, deleteChat } = useChatContext();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3">
        <h2 className="text-sm font-semibold mb-1.5">Chats</h2>
        {chats.map((chat, index) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={currentChat?.id === chat.id}
            onClick={() => setCurrentChat(chat)}
            onDelete={() => deleteChat(chat.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
