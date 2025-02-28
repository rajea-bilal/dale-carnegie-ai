import React, { useCallback } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { ChatListItem } from "./ChatListItem";

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

  const handleChatSelect = useCallback((chat: any) => {
    console.log("Entering handleChatSelect");
    if (currentChat?.id !== chat.id) {
      console.log("Selecting chat:", chat);
      setCurrentChat(chat);
    }
  }, [currentChat?.id, setCurrentChat]);

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-3">
        <h2 className="text-xs font-semibold mb-1.5 opacity-80">Chats</h2>
        {chats.map((chat, index) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={currentChat?.id === chat.id}
            onClick={() => handleChatSelect(chat)}
            onDelete={() => deleteChat(chat.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(ChatList);
