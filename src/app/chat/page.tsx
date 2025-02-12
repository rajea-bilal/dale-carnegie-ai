

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function ChatPage() {
  return (
    <main className="relative min-h-screen">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url(/wallpaper.jpeg)' }}
      />
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/30 z-10" />
      {/* Content */}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-between p-24">
        <ChatContainer />
      </div>
    </main>
  )
} 