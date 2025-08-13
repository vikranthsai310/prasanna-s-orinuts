import React, { useState, useCallback } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  onLoadError?: (error: string) => void;
}

/**
 * Validate if a URL is safe to load
 * @param url - URL to validate
 * @returns boolean - true if valid
 */
const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === '' || url === 'undefined' || url === 'null') {
    return false;
  }
  
  // Check for malformed data URLs
  if (url.startsWith('data:') && (url.includes('base64,=:') || url === 'data:;base64,=' || url.endsWith('=:1'))) {
    return false;
  }
  
  try {
    new URL(url, window.location.origin);
    return true;
  } catch {
    return false;
  }
};

/**
 * SafeImage component that prevents invalid URLs from causing errors
 */
export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  fallback = '/placeholder.svg',
  onLoadError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState<string>(() => {
    // Validate the initial src
    if (isValidImageUrl(src)) {
      return src;
    } else {
      console.warn(`Invalid image URL provided: ${src}, using fallback`);
      onLoadError?.(`Invalid URL: ${src}`);
      return fallback;
    }
  });

  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      const errorMsg = `Failed to load image: ${imageSrc}`;
      console.warn(errorMsg);
      onLoadError?.(errorMsg);
      
      // Try fallback if it's different and valid
      if (imageSrc !== fallback && isValidImageUrl(fallback)) {
        setImageSrc(fallback);
      }
    }
  }, [imageSrc, fallback, hasError, onLoadError]);

  // Update src when prop changes
  React.useEffect(() => {
    if (src !== imageSrc && isValidImageUrl(src)) {
      setImageSrc(src);
      setHasError(false);
    } else if (!isValidImageUrl(src) && src !== imageSrc) {
      console.warn(`Invalid image URL update: ${src}, keeping current`);
      onLoadError?.(`Invalid URL update: ${src}`);
    }
  }, [src, imageSrc, onLoadError]);

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      onError={handleError}
    />
  );
};

export default SafeImage;
