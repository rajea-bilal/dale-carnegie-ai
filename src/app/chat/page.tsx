import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatListContainer } from "@/components/chat/ChatListContainer";
import NavigationBar from "@/components/navigation/bar";
import { ChatProvider } from "@/contexts/ChatContext";

export default function ChatPage() {
  return (
    <main className="relative flex-grow min-h-0 z-20 px-14 pt-8">
      <ChatProvider>
        <div className="w-full grid grid-cols-[350px,1fr] flex-grow min-h-0 gap-7 h-full">
          <ChatListContainer />
          <ChatContainer />
        </div>
      </ChatProvider>
    </main>
  );
}
