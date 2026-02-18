# Burrow - Design Specification

## Overview

**Burrow** is a privacy-first, encrypted AI chat application. Users connect their crypto wallet to have end-to-end encrypted conversations with AI. The design must communicate trust, security, and modern sophistication.

---

## Brand Identity

### Name
**Burrow** - suggests a safe, protected space (like an animal's burrow), reinforcing the privacy and security aspects.

### Tagline
"Private by design. Encrypted by default."

### Core Values
- **Privacy**: User data is never exposed
- **Security**: Military-grade encryption
- **Simplicity**: Easy to use despite complex tech
- **Trust**: Transparent, open-source, user-controlled

---

## Target Audience

- **Primary**: Privacy-conscious tech users, crypto/web3 enthusiasts
- **Secondary**: Journalists, activists, professionals needing confidential AI assistance
- **Tertiary**: General users concerned about AI data privacy

**Demographics**: 25-45, tech-savvy, values privacy, likely holds crypto

---

## Design Principles

1. **Security First**: Visual cues should reinforce safety and encryption
2. **Minimalist**: Clean, uncluttered interface - content (chat) is king
3. **Dark Mode Native**: Dark interface reduces eye strain, feels more secure/private
4. **Wallet-Native**: Design for web3 users familiar with wallet connections
5. **Transparent**: Clear indicators of encryption status, connection state

---

## Color Palette

### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Burrow Green** | `#22c55e` | Primary actions, buttons, success states, brand accent |
| **Burrow Green Dark** | `#16a34a` | Hover states |
| **Burrow Green Light** | `#4ade80` | Highlights, glows |

### Background Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Background** | `#0a0a0a` | Main app background |
| **Surface** | `#171717` | Cards, sidebar, elevated surfaces |
| **Surface Hover** | `#262626` | Hover states on surfaces |
| **Border** | `#262626` | Subtle borders, dividers |
| **Border Light** | `#404040` | Active/selected borders |

### Text Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Text Primary** | `#fafafa` | Headlines, primary text |
| **Text Secondary** | `#a3a3a3` | Secondary text, timestamps |
| **Text Muted** | `#737373` | Placeholder text, hints |
| **Text Inverse** | `#0a0a0a` | Text on green buttons |

### Semantic Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Error** | `#ef4444` | Errors, disconnect, delete |
| **Error Surface** | `rgba(239, 68, 68, 0.1)` | Error backgrounds |
| **Success** | `#22c55e` | Success, encrypted, connected |
| **Warning** | `#f59e0b` | Warnings, pending states |

---

## Typography

### Font Family
- **Primary**: `Inter` (Google Fonts) - Modern, clean, highly legible
- **Monospace**: `JetBrains Mono` or `SF Mono` - For code blocks, wallet addresses

### Type Scale
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| **H1** | 48px | 700 | 1.1 | -0.02em |
| **H2** | 36px | 600 | 1.2 | -0.01em |
| **H3** | 24px | 600 | 1.3 | 0 |
| **H4** | 18px | 600 | 1.4 | 0 |
| **Body** | 16px | 400 | 1.5 | 0 |
| **Body Small** | 14px | 400 | 1.5 | 0 |
| **Caption** | 12px | 400 | 1.4 | 0.01em |
| **Label** | 11px | 500 | 1 | 0.05em (uppercase) |

---

## Layout Structure

### Overall Layout
```
+------------------------------------------+
|  SIDEBAR    |      MAIN CHAT AREA        |
|  (280px)    |                            |
|             |  +----------------------+  |
|  - Logo     |  |  Header              |  |
|  - New Chat |  |  (60px)              |  |
|  - History  |  +----------------------+  |
|  - Settings |                            |
|             |  +----------------------+  |
|  - Wallet   |  |                      |  |
|    Info     |  |   Chat Messages      |  |
|             |  |   (scrollable)       |  |
|             |  |                      |  |
|             |  +----------------------+  |
|             |                            |
|             |  +----------------------+  |
|             |  |  Input Area          |  |
|             |  |  (80px)              |  |
|             |  +----------------------+  |
+------------------------------------------+
```

### Responsive Breakpoints
- **Desktop**: > 1024px - Full layout with sidebar
- **Tablet**: 768px - 1024px - Collapsible sidebar, overlay on mobile
- **Mobile**: < 768px - Sidebar becomes bottom sheet or hamburger menu

---

## Key Screens

### 1. Landing Page ("Connect Screen")

**Purpose**: First impression, explain value prop, connect wallet

**Elements**:
- Large centered logo (Burrow icon + wordmark)
- Hero headline: "Private AI Conversations"
- Subheadline explaining encryption
- Featured icons: Shield, Lock, Wallet
- Primary CTA: "Connect Wallet" (RainbowKit button)
- Feature cards (3 columns on desktop)

**Design Notes**:
- Full-screen dark background
- Subtle gradient or glow behind logo
- Icons in green (#22c55e) on dark surface

---

### 2. Chat Interface

**Purpose**: Main interaction - sending/receiving encrypted messages

**Elements**:

#### Header
- Left: Menu toggle (mobile), Encryption status indicator
- Center: "New Chat" or conversation title
- Right: Settings link, Wallet address (truncated)

#### Message List
- User messages: Right-aligned, green background (#22c55e)
- AI messages: Left-aligned, dark surface background (#171717)
- Timestamp below each message (small, muted text)
- Markdown rendering for AI responses
- Code blocks: Darker background with syntax highlighting

#### Input Area
- Multi-line text input (auto-expanding)
- Send button (green, circular or rounded)
- Placeholder: "Type your message..."
- Hint text: "Messages are end-to-end encrypted"

**Design Notes**:
- Generous padding between messages (24px)
- Max-width for messages (80% of container)
- Smooth animations for new messages (fade + slide up)

---

### 3. Sidebar

**Purpose**: Navigation, conversation history, wallet info

**Elements**:
- Logo (small) + App name
- "New Chat" button (full-width, prominent)
- Conversation list (scrollable):
  - Title (truncated)
  - Last message preview (optional)
  - Timestamp
  - Delete button (hover-only)
- Footer:
  - Connected wallet address
  - Disconnect button

**States**:
- Active conversation: Highlighted background, left border in green
- Hover: Slightly lighter background

---

### 4. Encryption States

#### Deriving Key (Loading)
- Full-screen overlay or centered modal
- Animated spinner (green)
- Text: "Deriving encryption key..."
- Subtext: "Please sign the message in your wallet"
- Progress indicator (optional)

#### Encryption Active
- Small lock icon in header
- Tooltip on hover: "End-to-end encrypted"
- Green dot indicator

---

### 5. Admin Panel

**Purpose**: Manage system prompt for AI

**Elements**:
- Header with back button
- Textarea for system prompt (monospace font)
- Character count
- "Save Changes" button
- Version history list (optional)
- Tips/help section

---

## Components

### Buttons

**Primary Button**
- Background: #22c55e
- Text: #0a0a0a (black)
- Padding: 12px 24px
- Border-radius: 12px
- Font-weight: 600
- Hover: #16a34a

**Secondary Button**
- Background: transparent
- Border: 1px solid #404040
- Text: #fafafa
- Hover: Background #262626

**Icon Button**
- Size: 40px x 40px
- Border-radius: 8px
- Background: transparent
- Hover: #262626

### Inputs

**Text Input**
- Background: #171717
- Border: 1px solid #262626
- Border-radius: 12px
- Padding: 12px 16px
- Focus: Border #22c55e, subtle green glow
- Placeholder: #737373

**Textarea (Chat Input)**
- Auto-expanding (max 200px)
- Same styling as text input
- Submit on Enter (Shift+Enter for new line)

### Cards

**Feature Card (Landing)**
- Background: #171717
- Border: 1px solid #262626
- Border-radius: 16px
- Padding: 24px
- Icon container: 48px, rounded, green background

**Conversation Card (Sidebar)**
- Background: transparent
- Border-radius: 8px
- Padding: 12px
- Hover: #262626
- Active: #262626 + left border 2px green

### Icons

Use consistent icon set (Lucide or Heroicons):
- Shield (security/privacy)
- Lock (encrypted)
- Wallet (connection)
- MessageSquare (chat)
- Send (submit)
- Plus (new)
- Trash (delete)
- Settings (admin)
- ChevronLeft (back)

---

## Animations & Interactions

### Micro-interactions
- **Button hover**: 150ms ease-out, scale(1.02) optional
- **Message appear**: 300ms ease-out, fade + translateY(10px → 0)
- **Typing indicator**: Bouncing dots, 1.5s loop
- **Loading spinner**: Rotate 360°, 1s linear infinite

### Page Transitions
- **Route change**: Fade in, 200ms
- **Sidebar toggle**: Slide + fade, 300ms ease-in-out

### Scroll Behavior
- Smooth scrolling for message list
- Auto-scroll to bottom on new message
- Scroll-to-bottom button appears when scrolled up

---

## Assets Needed

### Logo
- SVG format
- Wordmark: "Burrow" in custom or Inter font
- Icon: Shield or lock motif, incorporating a burrow/tunnel concept
- Variants: Full (icon + wordmark), Icon only, Monochrome

### Icons
All icons should be in SVG, consistent stroke width (1.5-2px):
- Wallet connection
- Encryption/lock
- Send message
- New chat
- Delete
- Settings
- Menu (hamburger)

### Illustrations (Optional)
- Hero illustration for landing (encrypted message concept)
- Empty state illustrations

---

## Accessibility

- Minimum contrast ratio: 4.5:1 for text
- Focus indicators: Visible outline (2px green) on all interactive elements
- Keyboard navigation: Full support for Tab, Enter, Escape
- Screen reader: Proper ARIA labels on buttons and status indicators
- Reduced motion: Respect prefers-reduced-motion media query

---

## Technical Constraints

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS v3
- **UI Library**: Can use Radix UI for accessible primitives
- **Icons**: Lucide React or similar
- **Wallet**: RainbowKit (handles connection UI)
- **No**: Heavy 3D graphics, complex animations that impact performance

---

## Deliverables for Developer

1. **Figma file** with:
   - All screens at desktop (1440px) and mobile (375px)
   - Component library
   - Color styles
   - Text styles
   - Prototype flows

2. **Asset package**:
   - Logo SVGs (all variants)
   - Custom icons (if any)
   - Font files (if custom)

3. **Design tokens** (JSON/CSS):
   - Colors
   - Typography
   - Spacing
   - Border radius
   - Shadows

---

## Inspiration References

- **Chat UI**: Telegram (speed), Signal (privacy cues)
- **Dark Mode**: Linear, Vercel
- **Web3**: Rainbow Wallet, Zapper
- **Minimal**: Notion, Linear

---

## Questions for Designer

1. Should we have a light mode option, or dark-only?
2. Animated background (subtle particles/grain) or solid colors?
3. Custom illustration style, or purely icon-based?
4. Should the AI have a persona/avatar, or keep it minimal?
5. Mobile: Bottom nav or hamburger menu?

---

*Last updated: 2026-02-18*
*Contact: [Your contact info]*
