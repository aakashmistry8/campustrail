import React, { useState } from 'react';

/**
 * A custom image component that handles loading errors with fallbacks
 */
interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = '/images/default/image-placeholder.svg',
  className
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  
  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
    />
  );
};

/**
 * Utility function to preload images for faster rendering
 * @param imagePaths Array of image paths to preload
 */
export const preloadImages = (imagePaths: string[]) => {
  imagePaths.forEach(path => {
    const img = new Image();
    img.src = path;
  });
};

/**
 * Function to get a fallback image when an image fails to load
 * @param type Type of image to fallback to (e.g., 'destination', 'traveler')
 */
export const getFallbackImage = (type: 'destination' | 'traveler' | 'activity' = 'destination'): string => {
  switch (type) {
    case 'destination':
      return '/images/default/generic-landscape.svg';
    case 'traveler':
      return '/images/default/generic-traveler.svg';
    case 'activity':
      return '/images/default/generic-activity.svg';
    default:
      return '/images/default/image-placeholder.svg';
  }
};
