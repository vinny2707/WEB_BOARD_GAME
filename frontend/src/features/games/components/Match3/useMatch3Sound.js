// Match3 Sound Hook
import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing game sounds
 */
export const useMatch3Sound = () => {
  const swapSoundRef = useRef(null);
  const matchSoundRef = useRef(null);
  const comboSoundRef = useRef(null);
  const failSoundRef = useRef(null);
  const gameStartSoundRef = useRef(null);
  const victorySoundRef = useRef(null);

  // Initialize sounds
  useEffect(() => {
    swapSoundRef.current = new Audio('/sounds/swap.wav');
    matchSoundRef.current = new Audio('/sounds/match.wav');
    comboSoundRef.current = new Audio('/sounds/combo.wav');
    failSoundRef.current = new Audio('/sounds/fail-game.wav');
    gameStartSoundRef.current = new Audio('/sounds/GameStart.mp3');
    victorySoundRef.current = new Audio('/sounds/Victory.mp3');

    // Preload sounds
    swapSoundRef.current.load();
    matchSoundRef.current.load();
    comboSoundRef.current.load();
    failSoundRef.current.load();
    gameStartSoundRef.current.load();
    victorySoundRef.current.load();

    return () => {
      // Cleanup
      [swapSoundRef, matchSoundRef, comboSoundRef, failSoundRef, gameStartSoundRef, victorySoundRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current = null;
        }
      });
    };
  }, []);

  // Play sound helper
  const playSound = useCallback((soundType) => {
    const soundMap = {
      swap: swapSoundRef,
      match: matchSoundRef,
      combo: comboSoundRef,
      fail: failSoundRef,
      gameStart: gameStartSoundRef,
      victory: victorySoundRef
    };
    
    const soundRef = soundMap[soundType];
    if (soundRef?.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(() => {}); // Ignore autoplay errors
    }
  }, []);

  return { playSound };
};
