import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

// Type for the Jupiter plugin
type JupiterInitOptions = {
  displayMode: 'modal' | 'integrated' | 'widget';
  integratedTargetId: string;
  endpoint: string;
  formProps: {
    fixedInputMint?: boolean;
    fixedOutputMint?: boolean;
    initialInputMint?: string;
    initialOutputMint?: string;
    initialAmount?: string;
    initialOutputAmount?: string;
    slippageBps: number;
  };
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

declare global {
  interface Window {
    Jupiter: {
      init: (options: JupiterInitOptions) => void;
    };
  }
}

interface TokenInfo {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
}

interface JupiterSwapWidgetProps {
  inputMint: string;
  outputMint: string;
  inAmount?: string;
  outAmount?: string;
  slippageBps?: number;
  inputTokenInfo?: TokenInfo;
  outputTokenInfo?: TokenInfo;
  onSwapComplete?: () => void;
  className?: string;
};

export function JupiterSwapWidget({
  inputMint,
  outputMint,
  inAmount,
  outAmount,
  slippageBps = 50, 
  onSwapComplete, 
  className = ''
}: JupiterSwapWidgetProps) {
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    
    const initJupiter = () => {
      try {
        // Define the initialization options with proper types
        const initOptions = {
          displayMode: 'integrated' as const,
          integratedTargetId: 'jupiter-swap-widget',
          endpoint: 'https://api.mainnet-beta.solana.com',
          formProps: {
            fixedInputMint: true,
            fixedOutputMint: true,
            initialInputMint: inputMint,
            initialOutputMint: outputMint,
            ...(inAmount && { initialAmount: inAmount }),
            ...(outAmount && { initialOutputAmount: outAmount }),
            slippageBps,
          },
          onSuccess: () => {
            console.log('Swap completed successfully');
            onSwapComplete?.();
          },
          onError: (error: Error) => {
            console.error('Error in Jupiter swap:', error);
          },
        };

        // Initialize with properly typed options
        window.Jupiter.init(initOptions);
        isInitialized.current = true;
      } catch (error) {
        console.error('Failed to initialize Jupiter widget:', error);
      }
    };

    // Check if Jupiter is already loaded
    if (typeof window !== 'undefined' && window.Jupiter) {
      initJupiter();
    } else if (typeof document !== 'undefined') {
      // Load the Jupiter script if not already loaded
      const existingScript = document.querySelector('script[src^="https://terminal.jup.ag/"]');
      if (existingScript) {
        // If script is already in the document but Jupiter isn't available yet, wait for it
        const checkJupiter = setInterval(() => {
          if (window.Jupiter) {
            clearInterval(checkJupiter);
            initJupiter();
          }
        }, 100);
      } else {
        // Add the script to the document
        const script = document.createElement('script');
        script.src = 'https://terminal.jup.ag/main-v2.js';
        script.async = true;
        script.onload = initJupiter;
        document.head.appendChild(script);
      }
    }

    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [inputMint, outputMint, inAmount, outAmount, slippageBps, onSwapComplete]);

  return (
    <div className={`jupiter-swap-container ${className}`}>
      <div id="jupiter-swap-widget" ref={widgetContainerRef}></div>
      {slippageBps > 0 && (
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Slippage tolerance: {slippageBps / 100}%
        </p>
      )}
    </div>
  );
};

export default JupiterSwapWidget;
