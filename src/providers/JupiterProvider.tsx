import { FC, ReactNode } from 'react';

/**
 * This is a no-op provider since we're using the Jupiter Plugin directly.
 * The plugin handles its own wallet connection and RPC configuration.
 */
export const JupiterApiProviderWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default JupiterApiProviderWrapper;
