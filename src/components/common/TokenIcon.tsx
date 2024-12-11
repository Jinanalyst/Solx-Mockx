import Image from 'next/image';

interface TokenIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function TokenIcon({ symbol, size = 24, className = '' }: TokenIconProps) {
  const iconPath = `/images/tokens/${symbol.toLowerCase()}.png`;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={iconPath}
        alt={`${symbol} icon`}
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority={false}
        quality={75}
      />
    </div>
  );
}
