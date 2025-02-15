import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatListContainer } from "@/components/chat/ChatListContainer";
import NavigationBar from "@/components/navigation/bar";
import { ChatProvider } from "@/contexts/ChatContext";

export default function ChatPage() {
  return (
    <main className="relative flex-grow min-h-0">
      <div className="relative z-20 flex flex-col items-center justify-between mx-auto max-w-6xl py-10 h-full">
        <ChatProvider>
          <div className="w-full grid grid-cols-[350px,1fr] flex-grow min-h-0 gap-7">
            <ChatListContainer />
            <ChatContainer />
          </div>
        </ChatProvider>
      </div>
    </main>
  );
}
