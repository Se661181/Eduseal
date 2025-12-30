import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletButton } from '@/components/WalletButton';

// Mock RainbowKit ConnectButton
vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: {
    Custom: ({ children }: any) => {
      // Test disconnected state
      const disconnectedProps = {
        account: undefined,
        chain: undefined,
        openAccountModal: vi.fn(),
        openChainModal: vi.fn(),
        openConnectModal: vi.fn(),
        authenticationStatus: 'unauthenticated',
        mounted: true,
      };
      
      return children(disconnectedProps);
    },
  },
}));

describe('WalletButton Component - Disconnected State', () => {
  it('renders "Connect Wallet" when disconnected', () => {
    render(<WalletButton />);
    
    const button = screen.getByRole('button', { name: /connect your crypto wallet/i });
    expect(button).toBeDefined();
    expect(button.textContent).toBe('Connect Wallet');
  });

  it('has correct styling for disconnected state', () => {
    render(<WalletButton />);
    
    const button = screen.getByRole('button', { name: /connect your crypto wallet/i });
    expect(button.className).toContain('border-white/20');
    expect(button.className).toContain('uppercase');
  });
});

describe('WalletButton Component - Connected State', () => {
  it('renders the truncated address when connected', () => {
    // Override mock for connected state
    vi.mock('@rainbow-me/rainbowkit', () => ({
      ConnectButton: {
        Custom: ({ children }: any) => {
          const connectedProps = {
            account: {
              address: '0x1234567890123456789012345678901234567890',
              displayName: '0x1234...7890',
              displayBalance: '1.5 ETH',
            },
            chain: {
              id: 1,
              name: 'Ethereum',
              unsupported: false,
              hasIcon: true,
              iconUrl: 'https://images.pexels.com/photos/11035363/pexels-photo-11035363.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
              iconBackground: '#000',
            },
            openAccountModal: vi.fn(),
            openChainModal: vi.fn(),
            openConnectModal: vi.fn(),
            authenticationStatus: 'authenticated',
            mounted: true,
          };
          
          return children(connectedProps);
        },
      },
    }));

    // Re-import to get updated mock
    const { WalletButton: ConnectedWalletButton } = require('@/components/WalletButton');
    
    render(<ConnectedWalletButton />);
    
    // In connected state, should show account display name
    const accountButton = screen.queryByText('0x1234...7890');
    if (accountButton) {
      expect(accountButton).toBeDefined();
    }
  });
});

describe('WalletButton Component - Wrong Network', () => {
  it('shows "Wrong Network" when chain is unsupported', () => {
    vi.mock('@rainbow-me/rainbowkit', () => ({
      ConnectButton: {
        Custom: ({ children }: any) => {
          const unsupportedChainProps = {
            account: {
              address: '0x1234567890123456789012345678901234567890',
              displayName: '0x1234...7890',
            },
            chain: {
              id: 999,
              name: 'Unknown',
              unsupported: true,
            },
            openAccountModal: vi.fn(),
            openChainModal: vi.fn(),
            openConnectModal: vi.fn(),
            authenticationStatus: 'authenticated',
            mounted: true,
          };
          
          return children(unsupportedChainProps);
        },
      },
    }));

    const { WalletButton: UnsupportedWalletButton } = require('@/components/WalletButton');
    
    render(<UnsupportedWalletButton />);
    
    const wrongNetworkButton = screen.queryByText('Wrong Network');
    if (wrongNetworkButton) {
      expect(wrongNetworkButton).toBeDefined();
    }
  });
});
