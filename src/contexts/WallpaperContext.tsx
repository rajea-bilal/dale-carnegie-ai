"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AudioContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  wasPlayed: boolean;
}

const WallpaperContext = createContext<AudioContextType | undefined>(undefined);

export function WallpaperProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wasPlayed, setWasPlayed] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      setWasPlayed(true);
    }
  }, [isPlaying]);

  return (
    <WallpaperContext.Provider value={{ isPlaying, setIsPlaying, wasPlayed }}>
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper() {
  const context = useContext(WallpaperContext);
  if (context === undefined) {
    throw new Error("useWallpaper must be used within an AudioProvider");
  }
  return context;
}
