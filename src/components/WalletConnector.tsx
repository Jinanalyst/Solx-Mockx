import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { truncateAddress } from '@/lib/utils';

require('@solana/wallet-adapter-react-ui/styles.css');

const WalletConnector: FC = () => {
  const { publicKey, connected } = useWallet();

  return (
    <div className="flex items-center gap-2">
      <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
      {connected && publicKey && (
        <div className="text-sm text-gray-500">
          {truncateAddress(publicKey.toString())}
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
