import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShadowMint } from '@/components/ShadowMint';
import { WagmiProvider } from '@/providers/WagmiProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock wagmi hooks
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi');
  return {
    ...actual,
    useAccount: () => ({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    }),
    useWriteContract: () => ({
      writeContract: vi.fn(),
      isPending: false,
    }),
    useWaitForTransactionReceipt: () => ({
      isLoading: false,
      isSuccess: false,
    }),
  };
});

// Mock Reclaim SDK
vi.mock('@reclaimprotocol/js-sdk', () => ({
  ReclaimProofRequest: {
    init: vi.fn().mockReturnValue({
      buildProofRequest: vi.fn().mockResolvedValue({}),
      setAppCallbackUrl: vi.fn().mockReturnThis(),
      startSession: vi.fn().mockResolvedValue({
        requestUrl: 'https://mock-url.com',
        statusUrl: 'https://mock-status.com',
      }),
    }),
  },
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <WagmiProvider>{children}</WagmiProvider>
  </QueryClientProvider>
);

describe('ShadowMint Component', () => {
  it('renders the Initiate Bridge button correctly', () => {
    render(<ShadowMint />, { wrapper: TestWrapper });
    
    const button = screen.getByRole('button', { name: /initiate bridge/i });
    expect(button).toBeDefined();
    expect(button.textContent).toContain('Initiate Bridge');
  });

  it('renders component without errors', () => {
    const { container } = render(<ShadowMint />, { wrapper: TestWrapper });
    
    expect(container.querySelector('h2')?.textContent).toContain('Acquire Credential');
    expect(container.querySelector('p')?.textContent).toContain('Initiate TLS verification');
  });
});
