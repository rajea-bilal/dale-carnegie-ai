'use client'

import React, { createContext, useContext, useState } from 'react'

interface AudioContextType {
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
}

const WallpaperContext = createContext<AudioContextType | undefined>(undefined)

export function WallpaperProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <WallpaperContext.Provider value={{ isPlaying, setIsPlaying }}>
      {children}
    </WallpaperContext.Provider>
  )
}

export function useWallpaper() {
  const context = useContext(WallpaperContext)
  if (context === undefined) {
    throw new Error('useWallpaper must be used within an AudioProvider')
  }
  return context
}
