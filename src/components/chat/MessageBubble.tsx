import { cn } from '@/lib/utils'
import { MessageBubbleProps } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusIndicator } from './StatusIndicator'
import { AudioPlayer } from './AudioPlayer'

// This component displays a single message in our chat
// It handles both user messages and Dale's (assistant) responses
export function MessageBubble({ message, isLastMessage }: MessageBubbleProps) {
  // Check if this message is from the user or Dale
  // We'll use this to style and position the message differently
  const isUser = message.role === 'user'
  
  // If this is a status message (like "AI is thinking..."),
  // we show it in a special way using the StatusIndicator
  if (message.status) {
    return <StatusIndicator status={message.status} />
  }
  
  // When Dale is still thinking and generating a response,
  // we show a loading skeleton to indicate something's coming
  if (isLastMessage && !message.content) {
    return (
      <div className="space-y-2">
        {/* Shows the three bouncing dots */}
        <StatusIndicator isLoading={true} />
        {/* Shows a gray box where the message will appear */}
        <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
          <Skeleton className="h-16 w-[200px]" />
        </div>
      </div>
    )
  }

  // This is the main message display
  return (
    // Wrapper that handles message positioning
    // User messages go to the right, Dale's to the left
    <div className={cn(
      "flex w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* The actual message bubble */}
      {/* User messages are highlighted, Dale's are subtle */}
      <div className={cn(
        "rounded-lg px-4 py-2 max-w-[80%]",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {/* Container for message text and audio player */}
        <div className="flex items-start justify-between gap-2">
          {/* The actual message text */}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {/* Audio player only shows for Dale's messages */}
          {/* We also make sure there's actual content to speak */}
          {!isUser && message.content && (
            <AudioPlayer 
              text={message.content}
              className="mt-1 ml-2 flex-shrink-0"
            />
          )}
        </div>

        {/* If the message has citations (references to the book), */}
        {/* we show them below the message */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-border/50 pt-2">
            <p className="text-xs text-muted-foreground font-medium">Sources:</p>
            {/* List each citation with a bullet point */}
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