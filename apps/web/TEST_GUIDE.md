# LifeKit Frontend Testing Guide

## 🚀 Quick Start

### 1. Start the Development Server

```powershell
# Navigate to the web app directory
cd D:\ALGOFORCE_AI\LIFEKIT\Lifekit-AI\apps\web

# Start the Next.js dev server
npm run dev
```

The app will start at **http://localhost:3000**

---

## 📍 Test Routes & Features

### **Marketing Site**
- **Landing page**: http://localhost:3000/
  - Hero section with goal input
  - How LifeKit works
  - Core capabilities
  - User types (Professionals, Students, Founders, Families)
  - Marketplace preview
  - Pricing table
  - Final CTA

- **Product**: http://localhost:3000/product
- **Solutions**: http://localhost:3000/solutions
- **Pricing**: http://localhost:3000/pricing
- **Enterprise**: http://localhost:3000/enterprise
- **About**: http://localhost:3000/about
- **Contact**: http://localhost:3000/contact (working form)

### **Authentication** ✅
- **Sign Up**: http://localhost:3000/auth/sign-up
  - Test form validation
  - Password strength indicator
  - Terms acceptance required
  - Mock signup → onboarding

- **Sign In**: http://localhost:3000/auth/sign-in
  - Mock login (any email/password with 8+ chars)
  - Remember me checkbox
  - Forgot password link

- **Forgot Password**: http://localhost:3000/auth/forgot-password
  - Email submission
  - Success state

- **Email Verification**: http://localhost:3000/auth/verify-email?token=test
  - Loading state simulation
  - Success confirmation

### **Onboarding** ✨
**Start**: http://localhost:3000/onboarding

**7-Step Wizard:**
1. ✅ Welcome screen
2. ✅ Select user type (Professional/Student/Founder/Family)
3. ✅ Choose focus areas (multi-select)
4. ✅ Describe primary goal (min 10 chars)
5. ✅ Set preferences (timeline, hours/week, notifications)
6. ✅ AI analysis animation (5 steps)
7. ✅ Mission preview with milestones

**Test flow**: Complete all steps → Creates first mission

### **Dashboard** 🏠
**Home**: http://localhost:3000/home

**Features to test:**
- ✅ Greeting (changes by time of day)
- ✅ Goal input widget (AI Goal Engine)
- ✅ Metric cards (4 summary cards)
- ✅ Active missions grid (hover effects, progress rings)
- ✅ Today's execution plan (checkbox interactions)
- ✅ AI suggestions panel
- ✅ Upcoming deadlines
- ✅ Quick navigation to missions

### **Missions** 🎯
**List**: http://localhost:3000/missions

**Features:**
- ✅ Grid/List view toggle
- ✅ Search missions
- ✅ Filter by status (Active/Paused/Draft/Completed/At Risk)
- ✅ Sort by (Recently updated/Progress/Deadline/Name)
- ✅ Mission cards with:
  - Category badge
  - Progress bar
  - Status badge
  - Deadline
  - Actions menu (Pause/Resume/Duplicate/Archive/Delete)
- ✅ Delete confirmation dialog

**Mission Detail**: http://localhost:3000/missions/mission-1

**Features:**
- ✅ Mission header with progress ring
- ✅ Pause/Resume actions
- ✅ Tabbed interface:
  - Overview (goal, metrics, risks, stats)
  - Timeline (milestone roadmap with progress)
  - Tasks (placeholder)
  - Resources (placeholder)
  - Progress (placeholder)
  - Memory (placeholder)
  - Activity (placeholder)
- ✅ Next action card
- ✅ Back navigation

**New Mission**: http://localhost:3000/missions/new

**4-Step Creation:**
1. ✅ Describe goal (validation, category picker, dates, budget, constraints)
2. ✅ AI generation animation (5 progress steps)
3. ✅ Review generated plan (milestones, metrics, timeline)
4. ✅ Actions: Activate/Save as Draft/Edit/Regenerate

---

## 🎨 UI/UX Features to Test

### **Design System**
- ✅ Purple brand colors (`--primary` deep purple, `--accent` bright violet)
- ✅ Light/Dark theme toggle (top-bar avatar menu → theme icon)
- ✅ Smooth theme transitions
- ✅ Responsive breakpoints (mobile/tablet/desktop)
- ✅ Consistent spacing & shadows

### **Layout & Navigation**
**Desktop:**
- ✅ Collapsible sidebar (arrow toggle button)
- ✅ Logo + brand name
- ✅ Nav items with icons & labels
- ✅ Active route highlighting
- ✅ User menu at bottom
- ✅ Collapse/expand animation

**Mobile:**
- ✅ Bottom navigation (5 icons)
- ✅ Hamburger menu → full sidebar drawer
- ✅ Touch-friendly targets (min 44×44px)

**Top Bar:**
- ✅ Page title
- ✅ Search (Ctrl+K) → Command Menu
- ✅ Quick Create (+) → Quick action menu
- ✅ Notifications with badge count
- ✅ Theme switcher
- ✅ User avatar dropdown

### **Components**
- ✅ Buttons (all variants: default/outline/ghost/destructive/gradient)
- ✅ Input fields with icons & validation states
- ✅ Progress bars & progress rings
- ✅ Status badges (Draft/Active/Paused/Completed/At Risk)
- ✅ Category badges with colors
- ✅ Cards with hover effects
- ✅ Dialogs & confirmation modals
- ✅ Toasts (sonner notifications)
- ✅ Empty states with illustrations
- ✅ Loading skeletons
- ✅ Dropdown menus
- ✅ Select inputs
- ✅ Checkboxes & switches
- ✅ Tabs
- ✅ Tooltips

### **Interactions**
- ✅ Command Menu (Ctrl+K or Cmd+K)
- ✅ Quick Create menu
- ✅ Goal input (Ctrl+Enter to submit)
- ✅ Task checkbox optimistic updates
- ✅ Mission actions (pause/resume/delete)
- ✅ Filter & sort controls
- ✅ View switchers (grid/list)
- ✅ Form validation (real-time & on submit)
- ✅ Loading states
- ✅ Success/error toast messages

### **Keyboard Navigation**
- ✅ Ctrl+K: Open command menu
- ✅ Ctrl+Enter: Submit goal input
- ✅ Esc: Close dialogs
- ✅ Tab navigation throughout
- ✅ Focus indicators visible

### **Accessibility**
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Focus management
- ✅ Keyboard accessible
- ✅ Screen-reader friendly error messages
- ✅ Color contrast (WCAG AA)
- ✅ Reduced motion support

---

## 🧪 Test Scenarios

### **Happy Path: New User**
1. Visit landing page
2. Click "Get Started"
3. Complete sign-up form
4. Complete 7-step onboarding
5. Land on generated mission preview
6. Click "Create Mission"
7. Arrive at dashboard with first mission

### **Happy Path: Returning User**
1. Sign in at `/auth/sign-in`
2. Land on dashboard `/home`
3. View active missions
4. Complete a task (checkbox)
5. Click mission to see details
6. Create new mission
7. Toggle theme (light/dark)

### **Test Data Available**
The app uses **mock data** (no real backend needed):
- ✅ 3 mock missions (Software Engineer, Save ₹5 Lakh, Run Marathon)
- ✅ 4 mock tasks with different statuses
- ✅ 2 mock AI recommendations
- ✅ 2 mock opportunities
- ✅ 2 mock memories
- ✅ 3 mock notifications
- ✅ Mock user profile (Arjun Sharma)
- ✅ Mock analytics data

All data is in `src/constants/mock-data.ts`

---

## 🐛 Known Issues / Incomplete

### **Placeholder Pages** (show empty states):
- Tasks (`/tasks`)
- AI Coach (`/ai-coach`)
- AI Planner (`/ai-coach/planner`)
- Agents (`/agents`)
- Marketplace (`/marketplace`)
- Opportunities (`/opportunities`)
- Memory (`/memory`)
- Analytics (`/analytics`)
- Notifications (`/notifications`)
- Profile (`/profile`)
- Settings (`/settings`)

### **Features Not Yet Wired**:
- Real backend API calls (all use mock data)
- WebSocket for real-time updates
- Image uploads
- File attachments
- Payment integration (Razorpay/Stripe)
- Email notifications
- Calendar integrations

---

## 📦 Project Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth pages
│   │   ├── (dashboard)/         # Main app pages
│   │   ├── (marketing)/         # Public website
│   │   ├── (onboarding)/        # Setup wizard
│   │   ├── layout.tsx           # Root layout + providers
│   │   └── page.tsx             # Root redirect
│   │
│   ├── components/
│   │   ├── ui/                  # Shadcn primitives (20+ components)
│   │   ├── shared/              # Reusable (StatusBadge, ProgressRing, etc.)
│   │   ├── layout/              # Shell, Sidebar, TopBar, Nav
│   │   ├── navigation/          # CommandMenu, QuickCreate, GoalInput
│   │   ├── ai/                  # AI Coach panel
│   │   └── marketing/           # Public site components
│   │
│   ├── lib/
│   │   ├── api/                 # Mock API clients
│   │   ├── validation/          # Zod schemas
│   │   ├── websocket/           # WS client
│   │   └── utils.ts             # Helper functions
│   │
│   ├── stores/                  # Zustand stores
│   ├── types/                   # TypeScript types
│   ├── constants/               # Routes, categories, mock data
│   └── styles/                  # Global CSS
│
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

---

## 🎯 What to Check

### **Visual**
- [ ] LifeKit purple branding throughout
- [ ] Smooth animations (page transitions, hover effects)
- [ ] Consistent spacing
- [ ] No layout shifts
- [ ] Icons aligned properly
- [ ] Readable text contrast

### **Functional**
- [ ] All links work
- [ ] Forms validate properly
- [ ] Toasts appear on actions
- [ ] Modals open/close correctly
- [ ] Data loads (from mock)
- [ ] Search & filters work
- [ ] Theme switcher works
- [ ] Mobile navigation works

### **Responsive**
- [ ] Mobile (< 768px): bottom nav, single column
- [ ] Tablet (768-1024px): collapsible sidebar
- [ ] Desktop (> 1024px): full sidebar, multi-column

---

## 🔧 Troubleshooting

### **Port already in use**
```powershell
# Kill process on port 3000
npx kill-port 3000
npm run dev
```

### **Module not found errors**
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules, .next
npm install
npm run dev
```

### **TypeScript errors**
```powershell
# Run type check
npm run type-check
```

### **Build test**
```powershell
# Test production build
npm run build
```

---

## ✅ Test Checklist

- [ ] Landing page loads with full content
- [ ] Sign up flow completes
- [ ] Onboarding wizard works end-to-end
- [ ] Dashboard shows mock data
- [ ] Mission list displays 3 missions
- [ ] Mission detail page shows tabs
- [ ] New mission wizard generates plan
- [ ] Theme toggle works (light/dark)
- [ ] Command menu opens (Ctrl+K)
- [ ] Mobile navigation works
- [ ] All forms validate
- [ ] Toast notifications appear
- [ ] Empty states show properly
- [ ] Loading states appear
- [ ] No console errors

---

## 📝 Next Steps

Once basic testing is complete:

1. **Build remaining pages** (Tasks, AI Coach, Marketplace, etc.)
2. **Connect real backend APIs** (replace mock data)
3. **Add real authentication** (Better Auth / Auth.js)
4. **Implement WebSocket** (real-time updates)
5. **Add image uploads** (profile, missions)
6. **Integrate payments** (Razorpay/Stripe)
7. **Add email service** (notifications)
8. **Set up database** (missions, tasks, users)
9. **Deploy to production** (Vercel recommended)
10. **Add monitoring** (error tracking, analytics)

---

**Ready to test?** Run `npm run dev` and visit http://localhost:3000 🚀
