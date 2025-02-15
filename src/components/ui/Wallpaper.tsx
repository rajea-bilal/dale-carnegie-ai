"use client";
import { useRef, useEffect } from 'react';
import { useWallpaper } from '@/contexts/WallpaperContext';

interface WallpaperProps {
}

export const Wallpaper = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isPlaying } = useWallpaper();

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <>
      <video 
        ref={videoRef}
        className="fixed inset-0 w-full h-full object-cover z-0"
        style={{
          objectFit: 'cover',
          width: '100vw',
          height: '100vh',
          filter: 'contrast(1.1)',
          imageRendering: 'high-quality',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform'
        }}
        src="/wallpaper.mp4"
        muted
        playsInline
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black/30 z-10" />
    </>
  );
};

export default Wallpaper;
