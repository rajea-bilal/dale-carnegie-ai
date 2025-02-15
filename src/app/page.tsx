import { ChatContainer } from '@/components/chat/ChatContainer'
import AnimatedText from '@/components/ui/AnimatedText'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import WelcomeContainer from '@/components/home/WelcomeContainer'

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
          <WelcomeContainer />
        </div>
      </div>
    </main>
  )
}
