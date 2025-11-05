import React, { createContext, useContext, useMemo, useRef, useState, useEffect } from 'react';

const PlayerCtx = createContext(null);
export const usePlayer = () => useContext(PlayerCtx);

export default function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [current, setCurrent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      if (!a.duration) return setProgress(0);
      setProgress(a.currentTime / a.duration);
    };
    const onEnded = () => setIsPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnded);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnded);
    };
  }, []);

  const playTrack = (track) => {
    setCurrent(track);
    const a = audioRef.current;
    a.src = track.audioUrl;
    a.play().then(() => setIsPlaying(true));
  };

  const toggle = () => {
    const a = audioRef.current;
    if (!a.src) return;
    if (a.paused) a.play().then(() => setIsPlaying(true));
    else { a.pause(); setIsPlaying(false); }
  };

  const seekTo = (ratio) => {
    const a = audioRef.current;
    if (!a.duration) return;
    a.currentTime = ratio * a.duration;
    setProgress(ratio);
  };

  const value = useMemo(() => ({
    current, isPlaying, progress, playTrack, toggle, seekTo
  }), [current, isPlaying, progress]);

  return (
    <PlayerCtx.Provider value={value}>
      {children}
      <audio ref={audioRef} hidden preload="metadata" />
      <PlayerBar />
    </PlayerCtx.Provider>
  );
}

function PlayerBar() {
  const { current, isPlaying, progress, toggle, seekTo } = usePlayer();
  if (!current) return null;

  return (
    <div className="player-bar">
      <img src={current.coverUrl} alt="" className="player-cover" />
      <div className="player-info">
        <div className="player-title">{current.title}</div>
        <div className="player-artist">{(current.artists || []).map(a => a.name).join(', ')}</div>
        <div
          className="progress"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - r.left) / r.width;
            const clamped = Math.max(0, Math.min(1, ratio));
            seekTo(clamped);
          }}
        >
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <button onClick={toggle} className="player-button">
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}