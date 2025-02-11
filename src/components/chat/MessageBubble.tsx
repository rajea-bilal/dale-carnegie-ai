import { cn } from '@/lib/utils'
import { MessageBubbleProps } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusIndicator } from './StatusIndicator'

export function MessageBubble({ message, isLastMessage }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  // Status message
  if (message.status) {
    return <StatusIndicator status={message.status} />
  }
  
  // Loading state for streaming response
  if (isLastMessage && !message.content) {
    return (
      <div className="space-y-2">
        <StatusIndicator isLoading={true} />
        <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
          <Skeleton className="h-16 w-[200px]" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "rounded-lg px-4 py-2 max-w-[80%]",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-border/50 pt-2">
            <p className="text-xs text-muted-foreground font-medium">Sources:</p>
            {message.citations.map((citation, index) => (
              <div key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                <span>•</span>
                <span>{citation}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 