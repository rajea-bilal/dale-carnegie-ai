import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatListContainer } from "@/components/chat/ChatListContainer";
import Header from "@/components/Header";
import NavigationBar from "@/components/navigation/bar";
import { ChatProvider } from "@/contexts/ChatContext";

export default function ChatPage() {
  return (
    <main className="relative flex-grow min-h-0 z-20 px-14 pt-8">
      <Header />
      <ChatProvider>
        <div className="w-full grid grid-cols-[350px,1fr] flex-grow min-h-0 gap-7 h-full pt-16">
          <ChatListContainer />
          <ChatContainer />
        </div>
      </ChatProvider>
    </main>
  );
}
