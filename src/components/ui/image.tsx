'use client';

import React, { useState } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface ImageProps extends Omit<NextImageProps, 'onError'> {
  fallback?: React.ReactNode;
}

export function Image({ className, fallback, alt, ...props }: ImageProps) {
  const [error, setError] = useState(false);

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return (
    <NextImage
      className={cn('transition-opacity duration-300', className)}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}
