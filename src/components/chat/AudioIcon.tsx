'use client'

import { Volume2, Loader2, Pause, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// These are all the possible states our audio icon can be in
export type AudioState = 'idle' | 'loading' | 'playing' | 'error'

// What information our component needs to work
interface AudioIconProps {
  state: AudioState      // What state is the audio in right now?
  onClick: () => void    // What happens when we click the icon?
  className?: string     // Any extra styling classes we want to add
}

export function AudioIcon({ state, onClick, className }: AudioIconProps) {
  // This function gives us the right text to show when hovering over the icon
  // Example: When state is 'idle', hovering shows 'Play audio'
  const getTooltip = () => (
    state === 'idle' ? 'Play audio' :      // Default state, ready to play
    state === 'loading' ? 'Loading audio...' :  // When generating audio
    state === 'playing' ? 'Pause audio' :   // When audio is playing
    'Error loading audio'                   // When something goes wrong
  )

  // This function gives us the right icon to show based on our current state
  // Each icon comes from lucide-react and is styled consistently
  const getIcon = () => (
    state === 'idle' ? (
      <Volume2 className="w-4 h-4" />        // Speaker icon for ready to play
    ) : state === 'loading' ? (
      <Loader2 className="w-4 h-4 animate-spin" />  // Spinning loader while generating
    ) : state === 'playing' ? (
      <Pause className="w-4 h-4" />          // Pause icon while playing
    ) : (
      <AlertCircle className="w-4 h-4 text-destructive" />  // Red error icon if something fails
    )
  )

  // The button that wraps our icon
  return (
    <button
      onClick={onClick}  // What to do when clicked
      disabled={state === 'loading'}  // Can't click while loading
      title={getTooltip()}  // Hover text
      className={cn(
        // Makes the icon look like a clickable button
        "p-1.5 rounded-full",
        // Subtle background when you hover over it
        "hover:bg-muted/50",
        // Makes it look disabled when you can't click it
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Any custom classes passed to the component
        className
      )}
    >
      {getIcon()}  {/* The actual icon to display */}
    </button>
  )
} 