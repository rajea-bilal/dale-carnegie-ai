import { AnimatedCard, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { ReactNode } from 'react'

interface ChatCardProps {
  messages: any[]
  onClearChat: () => void
  children: ReactNode
}

export function ChatCard({ messages, onClearChat, children }: ChatCardProps) {
  return (
    <AnimatedCard delay={500} variant='Rotate' className="w-full max-w-2xl mx-auto flex flex-col bg-background/80 backdrop-blur-sm border-background/20 shadow-xl">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dale Carnegie AI</h2>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearChat}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {children}
    </AnimatedCard>
  )
}