

import { ChatContainer } from '@/components/chat/ChatContainer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url(/wallpaper.jpeg)' }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black/30 z-10" />
      
      {/* Landing Content */}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center text-center px-4">
        <div className="space-y-8 max-w-3xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-purple-100">
            Join Me for a Chat
            <span className="block">Dale Carnegie</span>
          </h1>
          <p className="text-xl text-purple-300 w-full sm:w-3/4 mx-auto">
            Bring your questions, concerns, and dreams. Let's make them happen together
          </p>
          <Link href="/chat" className="block mt-4">
            <Button 
              size="lg"
              className="text-lg px-8 py-6 bg-purple-100 text-black hover:bg-purple-200/80"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
