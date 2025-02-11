import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChatInputProps } from '@/types'

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
        placeholder="Ask about Dale Carnegie's principles..."
        className="min-h-[60px] resize-none"
        disabled={isLoading}
      />
      <Button 
        type="submit"
        disabled={isLoading || !input.trim()}
      >
        Send
      </Button>
    </form>
  )
} 