import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChatInputProps } from '@/types'
import { ArrowRight, Send, SendHorizonal } from 'lucide-react'

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading
}: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <Textarea
        value={input}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (!e.shiftKey) {
              e.preventDefault();
              if (input.trim() && !isLoading) {
                handleSubmit(e);
              }
            }
          }
        }}
        placeholder="Ask about Dale Carnegie's principles..."
        className="min-h-[60px] resize-none"
        disabled={isLoading}
        autoFocus
      />
      <Button 
        type="submit"
        disabled={isLoading || !input.trim()}
        aria-label="Send"
      >
        <ArrowRight />
      </Button>
    </form>
  )
} 