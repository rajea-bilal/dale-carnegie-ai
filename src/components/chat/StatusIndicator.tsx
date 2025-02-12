import { cn } from '@/lib/utils'

interface StatusIndicatorProps {
  status?: string;
  isLoading?: boolean;
}

export function StatusIndicator({ status, isLoading }: StatusIndicatorProps) {
  if (!status && !isLoading) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground italic px-4 py-2">
      {isLoading && (
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
      <span>{status || (isLoading ? 'AI is thinking...' : '')}</span>
    </div>
  )
} 