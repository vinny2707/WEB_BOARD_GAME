import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for playing game result sounds (win/lose)
 * Use this in game components to play sounds when game ends
 */
export const useGameSounds = () => {
    const defeatSoundRef = useRef(null);
    const victorySoundRef = useRef(null);

    useEffect(() => {
        // Preload sounds
        defeatSoundRef.current = new Audio('/sounds/Defeat.mp3');
        defeatSoundRef.current.load();

        victorySoundRef.current = new Audio('/sounds/Victory.mp3');
        victorySoundRef.current.load();
    }, []);

    const playDefeat = useCallback(() => {
        if (defeatSoundRef.current) {
            defeatSoundRef.current.currentTime = 0;
            defeatSoundRef.current.volume = 0.5;
            defeatSoundRef.current.play().catch(() => { });
        }
    }, []);

    const playVictory = useCallback(() => {
        if (victorySoundRef.current) {
            victorySoundRef.current.currentTime = 0;
            victorySoundRef.current.volume = 0.5;
            victorySoundRef.current.play().catch(() => { });
        }
    }, []);

    return { playDefeat, playVictory };
};

export default useGameSounds;
