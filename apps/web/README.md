# LifeKit — Frontend

The complete Next.js 15 frontend for **LifeKit: The AI Execution Marketplace for Human Goals**.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI |
| State | Zustand |
| Server state | TanStack Query |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Notifications | Sonner |
| Icons | Lucide React |
| Themes | next-themes |

---

## Quick Start

```bash
# From the web app directory
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** — it auto-redirects to `/home` (dashboard).

---

## All Routes

### Public (Marketing)
| Route | Page |
|---|---|
| `/` | Redirects to `/home` |
| `/product` | Product overview |
| `/solutions` | Solutions for each user type |
| `/pricing` | Pricing plans |
| `/enterprise` | Enterprise page |
| `/about` | About LifeKit |
| `/contact` | Contact form |
| `/marketplace-info` | Marketplace overview (public) |

### Authentication
| Route | Page |
|---|---|
| `/auth/sign-in` | Sign in |
| `/auth/sign-up` | Create account |
| `/auth/forgot-password` | Password reset request |
| `/auth/reset-password` | Set new password |
| `/auth/verify-email` | Email verification |
| `/auth/two-factor` | 2FA code entry |
| `/auth/callback` | OAuth callback |

### Onboarding
| Route | Page |
|---|---|
| `/onboarding` | 7-step setup wizard |

### Dashboard (App)
| Route | Page |
|---|---|
| `/home` | Dashboard — command centre |
| `/missions` | Mission list |
| `/missions/new` | Create mission wizard |
| `/missions/[id]` | Mission detail workspace |
| `/tasks` | Task management |
| `/ai-coach` | AI Coach chat |
| `/ai-coach/planner` | AI Planner |
| `/agents` | Specialist agent directory |
| `/agents/[id]` | Agent chat workspace |
| `/marketplace` | Marketplace |
| `/marketplace/[id]` | Listing detail + purchase |
| `/opportunities` | Opportunity feed |
| `/opportunities/[id]` | Opportunity detail |
| `/memory` | Life Memory |
| `/analytics` | Progress & analytics |
| `/notifications` | Notification centre |
| `/profile` | Profile management |
| `/settings` | Settings hub |
| `/settings/general` | Language, timezone, notifications |
| `/settings/appearance` | Theme, display |
| `/settings/ai` | AI preferences |
| `/settings/privacy` | Memory, data export |
| `/settings/security` | Password, 2FA, sessions |
| `/settings/integrations` | Connected apps |
| `/settings/subscription` | Plan management |
| `/settings/billing` | Billing & invoices |
| `/support` | Help & support |

## Architecture

```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/            # Auth pages (no sidebar)
│   ├── (dashboard)/       # Main app (with sidebar)
│   ├── (marketing)/       # Public website
│   └── (onboarding)/      # Setup wizard
│
├── components/
│   ├── ai/                # AI Coach panel
│   ├── layout/            # Shell, Sidebar, TopBar, Nav
│   ├── marketing/         # Public site components
│   ├── navigation/        # CommandMenu, GoalInput, QuickCreate
│   ├── shared/            # StatusBadge, ProgressRing, EmptyState…
│   └── ui/                # shadcn primitives (20+ components)
│
├── stores/                # Zustand stores
│   ├── ui-store.ts        # Sidebar, theme, panels
│   ├── auth-store.ts      # User, login, logout
│   ├── mission-store.ts   # Mission creation, cache
│   └── ai-coach-store.ts  # Coach messages, context
│
├── lib/
│   ├── api/               # Mock API clients (replace with real)
│   ├── validation/        # Zod schemas
│   ├── websocket/         # WS client
│   ├── permissions/       # Role/plan access checks
│   └── utils.ts           # Date, currency, string helpers
│
├── types/                 # TypeScript type definitions
├── constants/             # Routes, categories, mock data
└── styles/                # globals.css with design tokens
```

---

## Auth Flow

The app ships with **mock authentication** — no backend required to test.

- Visiting any `/auth/*` page when logged in → redirects to `/home`
- Visiting `/home` (or any dashboard page) when logged out → redirects to `/auth/sign-in`
- Sign in / sign up → sets mock user in Zustand (persisted to localStorage)
- Sign out → clears user and redirects to `/auth/sign-in`

To connect a real auth provider, replace the `login`/`logout` calls in:
- `stores/auth-store.ts`
- `app/(auth)/auth/sign-in/page.tsx`
- `app/(auth)/auth/sign-up/page.tsx`

---

## Mock Data

All data is served from `src/constants/mock-data.ts`:
- 3 missions (Software Engineer, Save ₹5 Lakh, Run Marathon)
- 4 tasks with priorities and due times
- 2 AI recommendations
- 3 opportunities (internship, job, scholarship)
- 2 memories
- 3 notifications
- 1 marketplace listing
- Analytics snapshot
- Mock user (Arjun Sharma, LifeKit Plus plan)

To connect to the real API, update the files in `src/lib/api/`.

---

## Design System

LifeKit uses a **deep purple / white** design system.

CSS variables defined in `src/app/globals.css`:

```css
--primary: deep purple (262 83% 38%)
--accent:  bright violet (264 100% 62%)
--background: white
--background-subtle: light lavender
--text-primary: dark navy-purple
--text-secondary: muted grey-purple
```

Both **light** and **dark** themes are fully supported. Toggle via the avatar menu in the top bar.

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run type-check   # TypeScript check (no emit)
npm run lint         # ESLint
```

---

## Connect to Backend

When the API is ready, update these files:

| File | Purpose |
|---|---|
| `src/lib/api/client.ts` | Base API client (set `NEXT_PUBLIC_API_URL`) |
| `src/lib/api/missions.ts` | Mission CRUD |
| `src/lib/api/tasks.ts` | Task CRUD |
| `src/lib/api/ai.ts` | AI Coach, agents, recommendations |
| `src/stores/auth-store.ts` | Auth session management |
| `src/lib/websocket/client.ts` | Real-time WS connection |

Set environment variables:

```env
NEXT_PUBLIC_API_URL=https://api.lifekit.ai
NEXT_PUBLIC_WS_URL=wss://ws.lifekit.ai
```

---

## Status

| Area | Status |
|---|---|
| Design system | ✅ Complete |
| All 50 routes | ✅ Complete |
| Auth flows | ✅ Complete (mock) |
| Dashboard + all pages | ✅ Complete |
| Mission creation wizard | ✅ Complete |
| AI Coach + Agents | ✅ Complete |
| Marketplace | ✅ Complete |
| Opportunities | ✅ Complete |
| Memory | ✅ Complete |
| Analytics | ✅ Complete |
| Settings (all 8 sub-pages) | ✅ Complete |
| Loading skeletons | ✅ Complete |
| Error boundaries | ✅ Complete |
| TypeScript (strict) | ✅ Zero errors |
| Production build | ✅ Passes |
| Real backend API | 🔜 Mock only |
| Payments (Razorpay/Stripe) | 🔜 Wired, not live |
| WebSocket real-time | 🔜 Client ready |
| Email notifications | 🔜 Not connected |
