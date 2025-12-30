# EduSeal Complete Deployment Guide

## 🎯 Overview

This guide walks you through deploying the complete EduSeal stack:
1. Smart contracts to Polygon Amoy testnet
2. Frontend DApp to production
3. Reclaim Protocol provider configuration
4. Eliza AI agent integration

---

## 📋 Prerequisites

### Required Accounts
- [ ] Polygon wallet with testnet MATIC ([Get from faucet](https://faucet.polygon.technology/))
- [ ] Reclaim Protocol developer account ([Sign up](https://dev.reclaimprotocol.org/))
- [ ] Alchemy account ([Free tier](https://www.alchemy.com/))
- [ ] PolygonScan API key ([Get here](https://polygonscan.com/apis))

### Required Tools
- [ ] Node.js 18+ and pnpm
- [ ] Foundry (Forge, Cast, Anvil)
- [ ] Git

---

## 🔧 Step 1: Environment Setup

### 1.1 Frontend Environment

```bash
# Copy example file
cp .env.local.example .env

# Edit .env and fill in:
# - VITE_RECLAIM_APP_ID
# - VITE_RECLAIM_APP_SECRET
# - VITE_RECLAIM_PROVIDER_ID
# - VITE_ALCHEMY_API_KEY (optional but recommended)
```

### 1.2 Smart Contract Environment

```bash
# Navigate to contracts directory
cd contracts

# Copy example file
cp .env.example .env

# Edit contracts/.env and fill in:
# - PRIVATE_KEY (your deployer wallet private key WITHOUT 0x)
# - API_KEY_ALCHEMY (your Alchemy API key)
# - POLYGONSCAN_API_KEY (for contract verification)
```

**⚠️ SECURITY WARNING:**
- Never commit `.env` files to git
- Keep your `PRIVATE_KEY` secret
- Use a dedicated deployment wallet (not your main wallet)

---

## 🎨 Step 2: Reclaim Protocol Configuration

### 2.1 Create Reclaim Application

1. Visit [Reclaim Developer Portal](https://dev.reclaimprotocol.org/)
2. Click "Create Application"
3. Name: "EduSeal Credential Verifier"
4. Copy the **App ID** and **App Secret**

### 2.2 Create Custom Provider

#### Option A: Canvas LMS Provider

1. Click "Create Provider" → "Custom Provider"
2. **Provider Name:** Canvas LMS - Student Profile
3. **Target URL:** `*/api/v1/users/self/profile`
4. **Login URL:** `https://canvas.instructure.com/login` (or your university's Canvas URL)
5. **Response Type:** JSON
6. **Response Matches:**

```json
{
  "responseSelections": [
    {
      "responseMatch": "\"name\"\\s*:\\s*\"([^\"]+)\"",
      "xPath": ""
    },
    {
      "responseMatch": "\"primary_email\"\\s*:\\s*\"([^\"]+)\"",
      "xPath": ""
    },
    {
      "responseMatch": "\"id\"\\s*:\\s*(\\d+)",
      "xPath": ""
    }
  ]
}
```

7. Copy the **Provider ID** (UUID format)

#### Option B: Generic Gradebook Provider

Use the regex from `docs/reclaim-provider-config.json` for HTML gradebook scraping.

### 2.3 Update Frontend .env

```bash
# In root .env file
VITE_RECLAIM_APP_ID=0x_your_app_id_from_step_2.1
VITE_RECLAIM_APP_SECRET=0x_your_app_secret_from_step_2.1
VITE_RECLAIM_PROVIDER_ID=your_provider_uuid_from_step_2.2
```

---

## 🚀 Step 3: Smart Contract Deployment

### 3.1 Install Dependencies

```bash
cd contracts

# Install Foundry dependencies
forge install

# Verify installation
forge --version
```

### 3.2 Compile Contracts

```bash
# Compile all contracts
forge build

# Expected output:
# [⠊] Compiling...
# [⠒] Compiling 3 files with Solc 0.8.29
# [⠢] Solc 0.8.29 finished in 2.5s
# Compiler run successful!
```

### 3.3 Run Tests

```bash
# Run all tests with verbose output
forge test -vvv

# Expected output:
# Running 5 tests for test/EduSealRegistry.t.sol:EduSealRegistryTest
# [PASS] testMintCredential() (gas: 123456)
# [PASS] testVerifyProof() (gas: 234567)
# ...
# Test result: ok. 5 passed; 0 failed;
```

### 3.4 Deploy to Polygon Amoy

```bash
# Deploy with verification
forge script script/Deploy.s.sol \
  --rpc-url polygon_amoy_alchemy \
  --broadcast \
  --verify \
  -vvvv

# Alternative: Use public RPC (may be slower)
forge script script/Deploy.s.sol \
  --rpc-url polygon_amoy \
  --broadcast \
  --verify \
  -vvvv
```

**Expected Output:**
```
== Logs ==
Deploying EduSealRegistry...
EduSealRegistry deployed to: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

Starting contract verification...
Submitting verification for [EduSealRegistry] at 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Contract verification successful!
```

### 3.5 Update Metadata

The deployment script automatically updates `contracts/interfaces/metadata.json`:

```json
{
  "chains": [
    {
      "name": "devnet",
      "chainId": 80002,
      "rpc": "https://rpc-amoy.polygon.technology",
      "contracts": {
        "EduSealRegistry": {
          "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          "abi": [...]
        }
      }
    }
  ]
}
```

**Copy this file to frontend:**
```bash
cp contracts/interfaces/metadata.json ../src/metadata.json
```

---

## 🌐 Step 4: Frontend Deployment

### 4.1 Install Dependencies

```bash
# Return to root directory
cd ..

# Install frontend dependencies
pnpm install
```

### 4.2 Build Frontend

```bash
# Build for production
pnpm build

# Expected output:
# vite v5.0.0 building for production...
# ✓ 1234 modules transformed.
# dist/index.html                   1.23 kB
# dist/assets/index-abc123.js      456.78 kB
# ✓ built in 12.34s
```

### 4.3 Test Locally

```bash
# Start development server
pnpm dev

# Open browser to http://localhost:5173
# Test the following:
# 1. Wallet connection (RainbowKit)
# 2. Shadow Mint flow (Reclaim verification)
# 3. Talent Scout dashboard
# 4. API endpoint: /api/verify-user?address=0x...
```

### 4.4 Deploy to Production

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set environment variables in Vercel dashboard
# - Deploy
```

#### Option B: Netlify

```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

#### Option C: Custom Server

```bash
# Build static files
pnpm build

# Serve dist/ folder with any static file server
# Example with nginx:
# - Copy dist/ to /var/www/eduseal
# - Configure nginx to serve from that directory
```

---

## 🤖 Step 5: Eliza AI Agent Integration

### 5.1 Install Eliza Framework

```bash
# In your Eliza project directory
npm install @ai16z/eliza
```

### 5.2 Copy Action File

```bash
# Copy the checkCredential action
cp src/eliza/actions/checkCredential.ts /path/to/your/eliza/project/src/actions/

# Update imports to use actual Eliza package
# (Remove mock types and use real @ai16z/eliza imports)
```

### 5.3 Register Action

In your Eliza agent configuration:

```typescript
import { checkCredentialAction } from './actions/checkCredential';

const agent = {
  name: "EduSeal Talent Scout",
  actions: [
    checkCredentialAction,
    // ... other actions
  ],
  // ... other config
};
```

### 5.4 Configure API Endpoint

Update `checkCredential.ts` line 156:

```typescript
const apiUrl = `https://your-production-domain.com/api/verify-user?address=${userAddress}`;
```

### 5.5 Test Agent

```
User: "Do I have a degree?"
Agent: "I'd be happy to check your credentials! Could you please provide your Ethereum wallet address?"

User: "My address is 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
Agent: "🎓 Congratulations! Your credentials are verified on the blockchain! You have a Bachelor of Science degree with 95% issuer confidence..."
```

---

## ✅ Step 6: Verification Checklist

### Smart Contract Verification

- [ ] Contract deployed to Polygon Amoy
- [ ] Contract verified on PolygonScan
- [ ] `metadata.json` updated with contract address
- [ ] Test mint transaction successful

**Test Command:**
```bash
cast call 0xYOUR_CONTRACT_ADDRESS \
  "getCredential(address)" \
  0xYOUR_WALLET_ADDRESS \
  --rpc-url polygon_amoy
```

### Frontend Verification

- [ ] Wallet connection works (RainbowKit)
- [ ] Reclaim proof generation successful
- [ ] Mint transaction completes
- [ ] Success animation displays (confetti + badge)
- [ ] Talent Scout dashboard loads
- [ ] Search functionality works
- [ ] API endpoint returns correct data

**Test URLs:**
- Main app: `https://your-domain.com/`
- Talent Scout: `https://your-domain.com/talent-scout`
- API: `https://your-domain.com/api/verify-user?address=0x...`

### Reclaim Protocol Verification

- [ ] Provider configured correctly
- [ ] Test proof generation in Reclaim dashboard
- [ ] Proof verification succeeds in smart contract
- [ ] Extracted data matches expected format

### AI Agent Verification

- [ ] Action registered in Eliza
- [ ] Trigger phrases work
- [ ] Address extraction successful
- [ ] API integration functional
- [ ] Response generation appropriate

---

## 🐛 Troubleshooting

### Issue: Contract Deployment Fails

**Error:** `insufficient funds for gas * price + value`

**Solution:**
```bash
# Get testnet MATIC from faucet
# Visit: https://faucet.polygon.technology/
# Enter your deployer wallet address
# Wait 1-2 minutes for MATIC to arrive
```

---

### Issue: Reclaim Proof Verification Fails

**Error:** `Invalid proof signature`

**Solution:**
1. Check that `VITE_RECLAIM_APP_ID` matches your Reclaim app
2. Verify provider ID is correct
3. Ensure regex patterns match your target data
4. Test regex at regex101.com

---

### Issue: Frontend Can't Connect to Contract

**Error:** `Contract not found` or `Chain mismatch`

**Solution:**
```bash
# 1. Verify metadata.json is copied to src/
cp contracts/interfaces/metadata.json src/metadata.json

# 2. Check VITE_CHAIN matches metadata.json chain name
# In .env:
VITE_CHAIN=devnet

# In metadata.json:
"chains": [{"name": "devnet", ...}]

# 3. Rebuild frontend
pnpm build
```

---

### Issue: API Endpoint Returns 404

**Error:** `GET /api/verify-user 404`

**Solution:**
- Ensure `src/api/verify-user.ts` exists
- Check Vite/Vercel serverless function configuration
- Verify `vercel.json` routes are correct
- Redeploy with `vercel --prod`

---

## 📊 Monitoring & Analytics

### Contract Events

Monitor contract events on PolygonScan:
```
https://amoy.polygonscan.com/address/0xYOUR_CONTRACT_ADDRESS#events
```

### Frontend Analytics

Add analytics to track:
- Wallet connections
- Mint attempts
- Success rate
- User journey through Shadow Mint flow

### API Monitoring

Track API endpoint usage:
- Request count
- Response times
- Error rates
- Popular addresses queried

---

## 🔐 Security Best Practices

### Smart Contract Security

- [ ] Audit contract code before mainnet deployment
- [ ] Use OpenZeppelin libraries for standard functionality
- [ ] Implement access controls (Ownable, AccessControl)
- [ ] Add pause functionality for emergency stops
- [ ] Test thoroughly with Foundry fuzzing

### Frontend Security

- [ ] Never expose private keys in frontend code
- [ ] Validate all user inputs
- [ ] Use HTTPS only in production
- [ ] Implement rate limiting on API endpoints
- [ ] Sanitize data from Reclaim proofs

### Operational Security

- [ ] Use hardware wallet for mainnet deployments
- [ ] Rotate API keys regularly
- [ ] Monitor contract for unusual activity
- [ ] Keep dependencies updated
- [ ] Implement multi-sig for contract ownership

---

## 🚀 Production Deployment (Polygon Mainnet)

### Prerequisites

- [ ] Thorough testing on Amoy testnet
- [ ] Security audit completed
- [ ] Sufficient MATIC for deployment (~0.5 MATIC)
- [ ] Backup of all private keys and credentials

### Deployment Steps

```bash
# 1. Update .env for mainnet
VITE_CHAIN=polygon

# 2. Update contracts/.env
# Use mainnet RPC and ensure sufficient MATIC

# 3. Deploy to Polygon mainnet
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url polygon \
  --broadcast \
  --verify \
  --slow

# 4. Update metadata.json with mainnet addresses

# 5. Rebuild and deploy frontend
cd ..
pnpm build
vercel --prod

# 6. Update Eliza agent API endpoint to production URL
```

---

## 📚 Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Reclaim Protocol Docs](https://docs.reclaimprotocol.org/)
- [Polygon Developer Docs](https://docs.polygon.technology/)
- [Eliza Framework](https://github.com/ai16z/eliza)
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [Wagmi Docs](https://wagmi.sh/)

---

## 🆘 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review error logs carefully
3. Search existing GitHub issues
4. Join Polygon Discord for network issues
5. Join Reclaim Protocol Discord for provider issues

---

## 🎉 Success!

Once deployed, your EduSeal stack includes:

✅ Smart contract on Polygon blockchain  
✅ Beautiful DApp with Shadow Mint flow  
✅ Talent Scout dashboard for recruiters  
✅ AI agent for credential verification  
✅ Reclaim Protocol integration for proof generation  

**Share your deployment:**
- Tweet about it with #EduSeal #ReclaimProtocol
- Add to your portfolio
- Submit to hackathons
- Help others deploy their own!
