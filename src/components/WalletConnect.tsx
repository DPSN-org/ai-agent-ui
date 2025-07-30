import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';

// Import the wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Define styles as a constant
const buttonStyles = {
  base: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid #8B5CF6',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    height: 'auto',
    lineHeight: '1.25rem',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#7C3AED',
      borderColor: '#7C3AED',
      opacity: 0.9,
    },
  },
  connected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    '&:hover': {
      backgroundColor: '#7C3AED',
      borderColor: '#7C3AED',
    },
  },
  notConnected: {
    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    border: 'none',
    color: 'white',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '&:hover': {
      background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
  },
};

export const WalletConnect = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    if (publicKey) {
      console.log(`Connected to wallet: ${publicKey.toBase58()}`);
      // You can add additional logic here when wallet connects
    }
  }, [publicKey]);

  const buttonStyle = {
    ...buttonStyles.base,
    ...(connected ? buttonStyles.connected : buttonStyles.notConnected),
  };

  return (
    <div className="wallet-connect-wrapper">
      <WalletMultiButton 
        className="wallet-multi-button"
        style={buttonStyle}
      >
        {connected && publicKey ? (
          <span style={{ 
            display: 'inline-block',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            verticalAlign: 'middle'
          }}>
            {`${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`}
          </span>
        ) : 'Connect Wallet'}
      </WalletMultiButton>
    </div>
  );
};
