import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading' | 'decoding'> {
  src: string;
  alt: string;
  priority?: boolean; // For above-the-fold images
  className?: string;
  wrapperClassName?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage Component
 * 
 * High-performance image component with:
 * - Lazy loading for below-the-fold images
 * - Eager loading for above-the-fold images
 * - Async decoding for non-blocking rendering
 * - Blur placeholder during load
 * - Error handling with fallback
 * - Responsive background for layout stability
 * 
 * Usage:
 * <OptimizedImage src="..." alt="..." priority={true} /> // Above fold
 * <OptimizedImage src="..." alt="..." /> // Below fold (lazy)
 */
const OptimizedImage = ({
  src,
  alt,
  priority = false,
  className,
  wrapperClassName,
  aspectRatio = 'auto',
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    console.error(`Failed to load image: ${src}`);
    onError?.();
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  }[aspectRatio];

  return (
    <div className={cn('relative overflow-hidden bg-accent', aspectRatioClass, wrapperClassName)}>
      {/* Blur placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent to-muted/50 animate-pulse" />
      )}
      
      {/* Optimized Image */}
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      ) : (
        // Fallback for error
        <div className="absolute inset-0 flex items-center justify-center bg-accent">
          <div className="text-center text-muted-foreground p-4">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
