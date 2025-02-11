'use client'

import { useChat } from 'ai/react'
import { Card } from '@/components/ui/card'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { Message } from '@/types'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function ChatContainer() {
  const [statusMessage, setStatusMessage] = useState<string>()

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
      // Handle streaming response start
      if (response.ok) {
        console.log('Response started')
      }
    },
    onFinish: (message: Message) => {
      // Clear status when response is complete
      setStatusMessage(undefined)
      console.log('Response finished', message)
    },
  })

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

  const allMessages = [
    ...messages,
    ...(statusMessage ? [{ role: 'system', content: '', status: statusMessage } as Message] : [])
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
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
      <div className="flex-1 overflow-hidden">
        <MessageList messages={allMessages} />
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