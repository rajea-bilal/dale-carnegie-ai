'use client'
import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { MessageListProps } from '@/types'

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    console.log('messages', messages)
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (!messages || messages.length === 0) {
    return (
      <ScrollArea className="h-full p-4">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-full p-4 pb-0 overflow-auto">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLastMessage={message.id === messages[messages.length - 1]?.id}
          />
        ))}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  )
} 