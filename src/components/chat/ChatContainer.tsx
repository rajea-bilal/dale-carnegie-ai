'use client'

import { useChat } from '@ai-sdk/react'
import { Card } from '@/components/ui/card'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { Message } from '@/types'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello friend! I'm Dale Carnegie, and I'm delighted to meet you. My passion is helping people like you build wonderful relationships and achieve their dreams through simple, heartfelt principles. What's on your mind? Let's talk"
}

export function ChatContainer() {
  const [statusMessage, setStatusMessage] = useState<string>()
  const [hasShownWelcome, setHasShownWelcome] = useState(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    setMessages,
  } = useChat({
    api: '/api/chat',
    onResponse: (response: Response) => {
      if (response.ok) {
        console.log('Response started')
      }
    },
    onFinish: (message: Message) => {
      setStatusMessage(undefined)
      console.log('Response finished', message)
    },
  })

  // Add welcome message when component first mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([WELCOME_MESSAGE])
    }
  }, []) // Empty dependency array - only runs once on mount

  // Handle status messages from the stream
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant' && !lastMessage.content) {
      setStatusMessage('AI is thinking...')
    }
  }, [messages])

  const handleClearChat = () => {
    setMessages([])
    setStatusMessage(undefined)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-background/80 backdrop-blur-sm border-background/20 shadow-xl">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dale Carnegie AI</h2>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-hidden relative">
        <MessageList messages={messages} />
        {statusMessage && (
          <div className="absolute bottom-0 left-0 right-0 p-4 text-sm text-muted-foreground italic bg-background/80 backdrop-blur-sm">
            {statusMessage}
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </Card>
  )
} 