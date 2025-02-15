import { ChatContainer } from "@/components/chat/ChatContainer";
import NavigationBar from "@/components/navigation/bar";

export default function ChatPage() {
  return (
    <main className="relative min-h-screen">
      <div className="relative z-20 flex h-screen flex-col items-center justify-between px-16 py-10">
        <ChatContainer />
        <NavigationBar />
      </div>
    </main>
  );
}
