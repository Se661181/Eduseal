import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider as WagmiProviderBase } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { chain } from '@/utils/evmConfig';

const config = getDefaultConfig({
  appName: 'EduSeal',
  projectId: '45e6145313bafe637df02e2f1c84b06c',
  chains: [chain as any],
  ssr: false,
});

const queryClient = new QueryClient();

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProviderBase config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#D4AF37',
            accentColorForeground: '#0A0A0A',
            borderRadius: 'none',
            fontStack: 'system',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProviderBase>
  );
}
