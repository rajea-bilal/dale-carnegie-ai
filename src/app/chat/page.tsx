import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatListContainer } from "@/components/chat/ChatListContainer";
import NavigationBar from "@/components/navigation/bar";
import { ChatProvider } from "@/contexts/ChatContext";

export default function ChatPage() {
  return (
    <main className="relative min-h-screen">
      <div className="relative z-20 flex h-screen flex-col items-center justify-between px-16 py-10">
        <ChatProvider>
          <div className="flex flex-grow min-h-0 gap-6">
            <ChatListContainer />
            <ChatContainer />
          </div>
        </ChatProvider>
        <NavigationBar />
      </div>
    </main>
  );
}
