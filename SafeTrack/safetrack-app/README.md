# SafeTrack

Know when someone leaves. Know when they arrive. Know when something may
have gone wrong.

A Next.js 14 (App Router) + Prisma + PostgreSQL implementation of the
SafeTrack PRD: trip check-in/check-out, overdue detection, simulated
device events (fall, abnormal heart rate, no movement), manual SOS, and a
security operator dashboard.

## Stack

- Next.js 14, App Router, TypeScript, Tailwind CSS
- Prisma ORM + PostgreSQL (tested against a hosted Neon database)
- Cookie + JWT session auth (bcrypt password hashing), simplified per the
  hackathon scope — logging in is optional; unauthenticated requests fall
  back to a seeded demo user (`david@safetrack.demo`)

## Getting started

```bash
npm install
cp .env.example .env
# put a Postgres connection string in .env as DATABASE_URL
npx prisma migrate dev --name init
npm run seed        # creates the demo user + two trusted contacts
npm run dev
```

Open http://localhost:3000 — it redirects to `/dashboard`.

## Demo timing

`.env` controls how fast the demo runs:

```
GRACE_PERIOD_SECONDS=30      # how long after ETA before a trip goes OVERDUE
CONFIRM_WINDOW_SECONDS=20    # how long "are you okay?" waits before escalating
```

Set these low (as above) for a live hackathon demo; a real deployment
would use minutes, not seconds (e.g. 600 / 120).

## How the safety engine works

There's no background worker or cron job — this is a hackathon build.
Instead, `lib/engine.ts` exports `runSafetyEngine()`, which:

1. Finds `ACTIVE` trips past `expectedArrival + GRACE_PERIOD_MS` and turns
   them `OVERDUE`, creating a `PENDING_CONFIRM` alert.
2. Finds `PENDING_CONFIRM` alerts older than `CONFIRM_WINDOW_MS` and
   escalates them to `ACTIVE` / `HIGH` severity, flipping the trip to
   `EMERGENCY`.

It runs at the top of `GET /api/trips` and `GET /api/alerts`. The
dashboard, alert center, and admin pages all poll those endpoints every
2 seconds, so the engine effectively "ticks" whenever any client has a
tab open — enough to make the demo feel live without real infrastructure.

## Critical path (matches PRD section 24)

```
CHECK IN → TRIP ACTIVE → DEVICE/ETA EVENT → POTENTIAL DANGER →
"ARE YOU OK?" → NO RESPONSE → ALERT → CONTACT/SECURITY → RESOLVE
```

- **Check in**: `POST /api/trips`
- **Overdue / device event**: `runSafetyEngine()` / `POST /api/device-events`
- **"Are you okay?"**: dashboard shows `ConfirmModal` while an alert is
  `PENDING_CONFIRM`
- **No response → alert**: `PATCH /api/alerts/:id { action: "ESCALATE" }`,
  or automatic via the engine's confirm-window check
- **Contact / security sees it**: `/alerts` (trusted contact) and
  `/admin` (security), both backed by `GET /api/alerts?status=ACTIVE`
- **Resolve**: `PATCH /api/alerts/:id { action: "RESOLVE" }`

## Project layout

```
app/
  api/
    auth/{register,login,logout}
    trips/                 GET, POST
    trips/[id]/            GET
    trips/[id]/checkout/   POST
    alerts/                GET, POST
    alerts/[id]/           PATCH (CONFIRM_SAFE | ESCALATE | RESOLVE)
    device-events/         POST
    contacts/               GET, POST
  dashboard/               traveler view
  trips/new/                standalone trip form
  trips/[id]/               trip detail + history
  alerts/                   trusted-contact alert feed (read-only)
  admin/                    security operator dashboard
  login/, register/
components/                 shared UI: TripCard, TripForm, ConfirmModal,
                             SosSentPanel, StatusPill, NavTabs, AppHeader
lib/                        prisma client, auth, config, safety engine
prisma/schema.prisma        User, TrustedContact, Trip, Alert, DeviceEvent
```

## What's intentionally out of scope (see PRD section 21)

Real smartwatch hardware, AI medical diagnosis, facial recognition, a live
map with turn-by-turn routing, push/SMS notifications, and a security
org account system are all Phase 2+ per the roadmap. The `Simulate fall`
button on the dashboard stands in for a real wearable webhook by calling
the same `POST /api/device-events` endpoint a real device would.
