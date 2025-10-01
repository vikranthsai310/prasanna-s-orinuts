import React, { useState, useCallback } from 'react';
import { cleanImageUrl } from '@/services/imageService';

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
  
  // Check for malformed data URLs (comprehensive check)
  if (url.startsWith('data:') && (
    url.includes('base64,=:') || 
    url === 'data:;base64,=' || 
    url.endsWith('=:1') ||
    url === 'data:;base64,=:1' ||
    url.includes('data:;base64,=')
  )) {
    console.warn('SafeImage: Detected malformed data URL:', url);
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
    // Clean and validate the initial src
    const cleanedSrc = cleanImageUrl(src);
    if (cleanedSrc !== '/placeholder.svg' && isValidImageUrl(cleanedSrc)) {
      return cleanedSrc;
    } else {
      console.warn(`SafeImage: Invalid or malformed image URL provided: ${src}, using fallback: ${fallback}`);
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
