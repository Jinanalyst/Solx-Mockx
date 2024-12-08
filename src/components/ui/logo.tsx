'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizesMap = {
  sm: 24,
  md: 32,
  lg: 48,
};

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const imageSize = sizesMap[size];
  
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <Image
          src="/images/solx-logo.png"
          alt="SOLX Logo"
          width={imageSize}
          height={imageSize}
          className="object-contain"
        />
      </div>
      {showText && (
        <span className={cn(
          'font-bold tracking-tight bg-gradient-to-r from-green-400 to-purple-500 bg-clip-text text-transparent',
          {
            'text-xl': size === 'sm',
            'text-2xl': size === 'md',
            'text-3xl': size === 'lg',
          }
        )}>
          SOLX
        </span>
      )}
    </Link>
  );
}
