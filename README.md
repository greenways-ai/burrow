# Burrow

**Private, encrypted AI conversations with wallet-based identity.**

Burrow is a privacy-first chat application where users connect their crypto wallet to have encrypted conversations with AI. All messages are encrypted client-side using keys derived from your wallet signature - only you can read your conversations.

## Features

- 🔐 **Wallet-Based Encryption**: Connect any EVM wallet (MetaMask, Rainbow, WalletConnect, etc.)
- 🤖 **Swappable AI Providers**: Currently supports Kimi AI, easily extensible to Vertex AI
- 📝 **Admin-Managed Prompts**: System prompts controlled via admin panel
- ☁️ **Encrypted Cloud Storage**: Conversations stored encrypted on Supabase
- 🔄 **Cross-Device Sync**: Access conversations from any device by connecting the same wallet
- 🔒 **Zero-Knowledge**: Server never sees plaintext messages

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │ ───► │  Encryption  │ ───► │  Supabase   │
│  (Wallet)   │      │  (Wallet Key)│      │  (Storage)  │
└─────────────┘      └──────────────┘      └─────────────┘
       │                                            │
       └──────────── Decrypt Key ───────────────────┘
```

### Encryption Flow

1. **Key Derivation**: User signs a deterministic message with their wallet
2. **Encryption**: Messages encrypted with AES-GCM using derived key
3. **Storage**: Encrypted blobs stored in Supabase
4. **Decryption**: On login, derived key decrypts conversation history

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Wallet**: Wagmi + RainbowKit (50+ wallets supported)
- **Encryption**: Viem + Web Crypto API
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Kimi (default), Vertex AI (pluggable)

## Quick Start

### Prerequisites

- Node.js 20+
- Supabase account
- AI provider API key (Kimi or Vertex)

### Setup

```bash
# Clone and enter directory
cd burrow

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
# - SUPABASE_URL, SUPABASE_ANON_KEY
# - KIMI_API_KEY (or VERTEX_* for Google)
# - ADMIN_WALLET_ADDRESS

# Run database migrations
supabase migration up

# Start development server
npm run dev
```

### Environment Variables

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# AI Provider (choose one)
KIMI_API_KEY=sk-your-kimi-key
KIMI_MODEL=kimi-k2-0711-longcontext  # or kimi-k2-0711

# OR Google Vertex AI
VERTEX_PROJECT_ID=your-gcp-project
VERTEX_LOCATION=us-central1
VERTEX_MODEL=gemini-2.0-pro-exp-02-05

# Admin
ADMIN_WALLET_ADDRESS=0xYourAdminWallet

# Optional: Rate limiting
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

## Project Structure

```
burrow/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── chat/         # Chat streaming endpoint
│   │   └── admin/        # Admin endpoints
│   ├── chat/             # Chat interface
│   ├── admin/            # Admin panel
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── chat/             # Chat UI components
│   ├── wallet/           # Wallet connection
│   └── admin/            # Admin components
├── hooks/                # Custom React hooks
│   ├── useEncryption.ts  # Wallet-based encryption
│   └── useChat.ts        # Chat state management
├── lib/                  # Utilities
│   ├── ai/               # AI provider adapters
│   ├── crypto.ts         # Encryption helpers
│   └── supabase.ts       # Supabase client
├── types/                # TypeScript types
└── supabase/
    └── migrations/       # Database migrations
```

## Usage

### For Users

1. Connect your wallet using the "Connect" button
2. Sign the key derivation message (one-time)
3. Start chatting - all messages are encrypted automatically
4. Return anytime by connecting the same wallet

### For Admins

1. Connect the admin wallet configured in `ADMIN_WALLET_ADDRESS`
2. Navigate to `/admin`
3. Edit the master system prompt
4. Changes apply to all new conversations

## AI Provider Configuration

### Adding a New Provider

Create a new file in `lib/ai/`:

```typescript
// lib/ai/new-provider.ts
import { AIProvider, Message } from './types';

export class NewProvider implements AIProvider {
  async *stream(messages: Message[], systemPrompt: string) {
    // Implementation
  }
}
```

Update `lib/ai/index.ts` to include the new provider.

## Security Considerations

- **Key Storage**: Encryption keys are never stored - derived from wallet signature each session
- **Message Encryption**: All messages use AES-256-GCM with unique IVs
- **Wallet Security**: Standard EIP-191 signing for key derivation
- **No Recovery**: If wallet is lost, conversations cannot be recovered (by design)

## License

MIT
