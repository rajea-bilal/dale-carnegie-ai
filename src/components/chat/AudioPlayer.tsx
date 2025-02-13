'use client'

import { useState, useRef, useEffect } from 'react'
import { AudioIcon, AudioState } from './AudioIcon'

// What information our AudioPlayer needs to work
interface AudioPlayerProps {
  text: string        // The text we want to convert to speech
  className?: string  // Optional styling from parent component
}

export function AudioPlayer({ text, className }: AudioPlayerProps) {
  // Keep track of what state our audio is in (playing, loading, etc.)
  const [audioState, setAudioState] = useState<AudioState>('idle')
  
  // Store any error messages if something goes wrong
  const [error, setError] = useState<string | null>(null)
  
  // Keep track of our audio element (like an invisible speaker)
  // We use useRef because we want this to persist between renders
  // but not cause re-renders when we update it
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Clean up function: when component is removed from page
  // make sure to stop any playing audio and clean up resources
  useEffect(() => {
    return () => {
      // if we have an audio player, pause it
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // This function handles everything that happens when we click the audio icon
  const handleClick = async () => {
    try {
      // If audio is currently playing, pause it
      if (audioState === 'playing' && audioRef.current) {
        audioRef.current.pause()
        setAudioState('idle')
        return
      }

      // do we have an audio player and is it paused?
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play()
        setAudioState('playing')
        return
      }

      // If we get here, we need to generate new audio
      setAudioState('loading')  // Show loading spinner
      setError(null)           // Clear any old errors

      // Ask our API to convert text to speech
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      // If something went wrong with the API call
      if (!response.ok) {
        throw new Error('Failed to generate audio')
      }

      // Convert the API response into audio data
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create a new audio element with our generated speech
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      // What to do when the audio finishes playing
      audio.addEventListener('ended', () => {
        setAudioState('idle')              // Reset the icon
        URL.revokeObjectURL(audioUrl)      // Clean up memory
      })

      // What to do if there's an error playing the audio
      audio.addEventListener('error', () => {
        setAudioState('error')
        setError('Error playing audio')
        URL.revokeObjectURL(audioUrl)
      })

      // Start playing the audio
      await audio.play()
      setAudioState('playing')

    } catch (err) {
      // If anything goes wrong, show an error
      console.error('Audio error:', err)
      setAudioState('error')
      setError(err instanceof Error ? err.message : 'Error generating audio')
    }
  }

  // What we show on the page
  return (
    <div className={className}>
      {/* The clickable icon that changes based on our audio state */}
      <AudioIcon 
        state={audioState} 
        onClick={handleClick}
      />
      {/* Show any error messages if something went wrong */}
      {error && (
        <span className="text-xs text-destructive ml-2">{error}</span>
      )}
    </div>
  )
} 