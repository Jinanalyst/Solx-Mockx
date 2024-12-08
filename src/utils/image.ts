export function getImageUrl(url: string): string {
  // If the URL is from wsrv.nl or ipfs.io, try to use a more reliable alternative
  if (url.includes('wsrv.nl')) {
    // Remove wsrv.nl and use the original image URL
    const originalUrl = new URL(url);
    const params = new URLSearchParams(originalUrl.search);
    return params.get('url') || url;
  }

  if (url.includes('ipfs.io')) {
    // Try using a different IPFS gateway
    return url.replace('ipfs.io', 'cloudflare-ipfs.com');
  }

  return url;
}

export function getFallbackImageUrl(type: 'token' | 'nft' | 'avatar'): string {
  switch (type) {
    case 'token':
      return '/images/fallback-token.png';
    case 'nft':
      return '/images/fallback-nft.png';
    case 'avatar':
      return '/images/fallback-avatar.png';
    default:
      return '/images/fallback.png';
  }
}
