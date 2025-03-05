import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatListContainer } from "@/components/chat/ChatListContainer";
import Header from "@/components/Header";
import NavigationBar from "@/components/navigation/bar";
import { ChatProvider } from "@/contexts/ChatContext";


// ChatPage - the main chat page component
// holds the entire chat interface
// sets up the layout grid for desktop and mobile view
// wraps everything in the chat provider context
// ChatListContainer - displays the list of chat conversations
// ChatContainer - displays the current chat conversation, message list, input field

// Data flow
// User types in ChatInput
// Message is sent to the API
// Response is received and added to the message list
// MessageList renders the new message as a MessageBubble
// Dale Carnegie's response include his avatar

export default function ChatPage() {
  return (
    <main className="relative flex-grow min-h-0 z-20 px-14 pt-8 pb-20">
      <Header />
      <ChatProvider>
        <div className=" w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[200px,1fr] lg:grid-cols-[350px,1fr] grid-rows-[auto,1fr] md:grid-rows-none h-[85vh] md:h-full flex-grow min-h-0 gap-7 pt-20">
          <ChatListContainer />
          <ChatContainer />
        </div>
      </ChatProvider>
    </main>
  );
}
