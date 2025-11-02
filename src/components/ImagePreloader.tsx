import { useEffect, useState } from 'react';
import { preloadCriticalImages, preloadFirebaseImages, getCacheStats } from '@/services/imagePreloader';

interface ImagePreloaderProps {
  onComplete?: (stats: { preloadedCount: number; loadingCount: number; totalMemory: number }) => void;
  preloadAll?: boolean; // If true, preloads all images; if false, only critical images
}

const ImagePreloader = ({ onComplete, preloadAll = false }: ImagePreloaderProps) => {
  const [isPreloading, setIsPreloading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const preloadImages = async () => {
      try {
        setIsPreloading(true);
        setProgress(0);

        if (preloadAll) {
          // Preload all Firebase images
          await preloadFirebaseImages();
        } else {
          // Preload only critical images for faster initial load
          await preloadCriticalImages();
        }

        const stats = getCacheStats();
        
        setProgress(100);
        setIsPreloading(false);
        
        if (onComplete) {
          onComplete(stats);
        }
      } catch (error) {
        console.error('❌ Error during image preloading:', error);
        setIsPreloading(false);
        setProgress(0);
      }
    };

    // Start preloading after a small delay to not block initial render
    const timer = setTimeout(preloadImages, 100);
    
    return () => clearTimeout(timer);
  }, [preloadAll, onComplete]);

  // This component doesn't render anything visible, but you can add a loading indicator if needed
  if (process.env.NODE_ENV === 'development' && isPreloading) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          backgroundColor: '#f0f0f0',
          zIndex: 9999,
          opacity: 0.7
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#4f46e5',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    );
  }

  return null;
};

export default ImagePreloader;
