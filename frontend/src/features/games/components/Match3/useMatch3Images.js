// Match3 Images Hook
import { useRef, useEffect } from 'react';
import { ALL_CANDY_ICONS } from './constants';

/**
 * Custom hook for loading and managing candy images
 */
export const useMatch3Images = () => {
  const imagesRef = useRef([]);
  const imagesLoadedRef = useRef(false);

  useEffect(() => {
    const loadImages = () => {
      const images = ALL_CANDY_ICONS.map(src => {
        const img = new Image();
        img.src = src;
        return img;
      });
      imagesRef.current = images;
      Promise.all(images.map(img => new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      }))).then(() => { 
        imagesLoadedRef.current = true; 
      });
    };
    loadImages();
  }, []);

  return { imagesRef, imagesLoadedRef };
};
