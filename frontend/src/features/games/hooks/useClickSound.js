import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for playing UI click sounds
 * Use this for buttons and interactive elements outside of gameplay
 */
export const useClickSound = () => {
    const clickSoundRef = useRef(null);

    useEffect(() => {
        clickSoundRef.current = new Audio('/sounds/GenericClick.mp3');
        clickSoundRef.current.load();
    }, []);

    const playClick = useCallback(() => {
        if (clickSoundRef.current) {
            clickSoundRef.current.currentTime = 0;
            clickSoundRef.current.play().catch(() => { });
        }
    }, []);

    return playClick;
};

export default useClickSound;
