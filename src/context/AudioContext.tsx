import { useCallback, useRef, useState } from 'react';
import { AudioCtx } from './audioCtx';

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
  }, []);

  const play = useCallback(
    (id: string, src: string) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        audioRef.current = null;
      });
      audio.play().catch((err) => {
        console.error('Audio playback failed:', err);
        setPlayingId(null);
        audioRef.current = null;
      });
      setPlayingId(id);
    },
    [],
  );

  const toggle = useCallback(
    (id: string, src: string) => {
      if (playingId === id) {
        pause();
      } else {
        play(id, src);
      }
    },
    [playingId, play, pause],
  );

  return (
    <AudioCtx.Provider value={{ playingId, play, pause, toggle }}>
      {children}
    </AudioCtx.Provider>
  );
}
