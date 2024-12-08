import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="SolarDEX - A Secure Solana Decentralized Exchange"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to RPC */}
        <link 
          rel="preconnect" 
          href="https://api.mainnet-beta.solana.com" 
          crossOrigin="anonymous" 
        />
        
        {/* Security Headers */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' https://api.mainnet-beta.solana.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
