import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="px-6 py-2 bg-transparent border border-white/20 text-white font-mono text-xs uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all cursor-pointer"
                    aria-label="Connect your crypto wallet"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="px-6 py-2 bg-red-900/20 border border-red-500/30 text-red-400 font-mono text-xs uppercase tracking-widest hover:bg-red-900/30 transition-colors cursor-pointer"
                    aria-label="Switch to supported network"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    className="px-4 py-2 bg-[#0A0A0A] border border-white/10 text-white/60 font-mono text-xs hover:border-[#D4AF37] transition-colors cursor-pointer"
                    aria-label={`Current network: ${chain.name}`}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                          display: 'inline-block',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="px-6 py-2 bg-transparent border border-white/20 text-[#D4AF37] font-mono text-xs uppercase tracking-widest hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all cursor-pointer"
                    aria-label={`Account: ${account.displayName}`}
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
