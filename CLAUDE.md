# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MightyKidz is a church children's ministry management system built with Next.js 15, TypeScript, Firebase, and Genkit AI. It handles kid check-ins, coin rewards, gift store redemptions, and volunteer management.

The app lives inside `mightykidzapp/` — that is the working directory for all development commands.

## Commands

Run from `mightykidzapp/`:

```bash
npm run dev          # Start dev server on localhost:9002 (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit (type check without building)
npm run genkit:dev   # Start Genkit AI dev UI
```

Run from `mightykidzapp/functions/`:

```bash
npm run build        # Compile Cloud Functions TypeScript
npm run serve        # Build + start Firebase emulators (functions only)
npm run deploy       # Deploy functions to Firebase
```

## Architecture

### Frontend (Next.js App Router)

All pages use the App Router under `src/app/`. Authenticated routes are grouped under `src/app/(authenticated)/` and are protected via the `useAuth` hook.

| Route | Purpose |
|---|---|
| `/login` | Firebase email/password auth |
| `/dashboard` | Stats and attendance charts |
| `/check-in` | Real-time Sunday check-in with coin awards |
| `/kids` | Kid profile CRUD |
| `/store` | Gift store and redemptions |
| `/volunteers` | Volunteer CRUD |

### Data Layer

`src/lib/data.ts` is the single data access layer — all Firestore reads/writes go through functions exported from this file. Do not add Firestore calls directly in components or pages.

`src/lib/types.ts` defines all core types: `Kid`, `Gift`, `Volunteer`, `RecentActivity`, `DashboardStats`.

### Firestore Collections

```
/admins/{userId}
/kids/{kidId}
  /attendances/{attendanceId}
  /coinTransactions/{transactionId}
  /redemptions/{redemptionId}
/gifts/{giftId}
/volunteers/{volunteerId}
/volunteerSchedules/{scheduleId}
```

### Security Model

Firestore rules (`firestore.rules`) enforce admin-only access to all collections. A user is an admin if they have a document at `/admins/{userId}`. The client cannot write to `/admins` — this must be done via the Firebase console or Cloud Functions.

### AI Integration

Genkit flows in `src/ai/flows/` generate personalized celebration messages using Google Gemini 2.5 Flash. There are three flows: check-in, birthday, and gift redemption messages. The Genkit client is initialized in `src/ai/genkit.ts`.

### Authentication

`src/hooks/use-auth.tsx` provides a React context with the current Firebase user. Wrap components that need auth state with `useAuth()`. Firebase is initialized in `src/lib/firebase/firebase.ts`.

### UI Conventions

- Components use shadcn/ui primitives from `src/components/ui/`
- Tailwind CSS with HSL CSS variables defined in `src/app/globals.css`
- Forms use React Hook Form + Zod validation
- Toast feedback via `useToast` hook
- Confetti/celebration effects in `src/components/confetti.tsx`
