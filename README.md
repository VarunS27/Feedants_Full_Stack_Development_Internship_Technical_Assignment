# Feedants — Competition Details Module

A functional full-stack implementation of the Feedants **Competition Details** screen.

Everything on the screen — title, pricing, judge, dates, rewards, previous winners, spot
counts, countdown and the primary action button — is served by the backend and computed
from the database. Nothing on the screen is hardcoded in the app.

| Layer | Stack |
| --- | --- |
| Frontend | React Native (Expo SDK 51), NativeWind (Tailwind), React Query, React Navigation |
| Backend | Node.js, Express 4, Zod, JWT |
| Database | MongoDB with Mongoose |

---

## Table of contents

1. [Running the project](#running-the-project)
2. [Environment variables](#environment-variables)
3. [API reference](#api-reference)
4. [Data model](#data-model)
5. [How the screen stays dynamic](#how-the-screen-stays-dynamic)
6. [Concurrency and data consistency](#concurrency-and-data-consistency)
7. [Validations and edge cases](#validations-and-edge-cases)
8. [Assumptions](#assumptions)
9. [Technical decisions](#technical-decisions)
10. [Trade-offs](#trade-offs)
11. [What I would change for production](#what-i-would-change-for-production)

---

## Running the project

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)
- Expo Go on a phone, an Android emulator, or an iOS simulator

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed:fresh
npm run dev
```

The API starts on `http://localhost:5000`. Check it with `curl http://localhost:5000/api/health`.

`npm run seed:fresh` wipes and reseeds. It prints the competition id, the slug and the demo
credentials, and creates four competitions that cover every lifecycle state:

| Slug | State it demonstrates |
| --- | --- |
| `feedants-classical-dance` | The design screen: registration open, live countdown, 1/20 booked |
| `feedants-singing-sold-out` | Every spot booked → `Registration Full` |
| `feedants-painting-closed` | Registration deadline passed, submissions still open |
| `feedants-photography-results` | Finished, results declared |

Demo accounts (both use password `Feedants@123`):

| Email | State |
| --- | --- |
| `demo@feedants.com` | Already registered for the main competition — matches the design |
| `guest@feedants.com` | Not registered — shows the `Register Now` path |

> Dates are seeded **relative to seed time** so the countdown is genuinely live. Pass
> `node src/seed/seed.js --literal-dates` to seed the exact Aug–Sep 2026 dates from the design.

### 2. Mobile app

```bash
cd mobile
npm install
npm start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

The app discovers the API automatically from the Expo host, so it works on an emulator and on
a physical device on the same network without editing code. To point it elsewhere:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.5:5000/api npm start
```

### 3. Verifying the concurrency guarantees

```bash
cd backend
npm run test:concurrency
```

This fires 30 simultaneous registrations at a 5-spot competition and 8 simultaneous
registrations from a single user, then asserts against the database:

```
Test 1 — oversell protection
  successful registrations : 5  (expected 5)
  registration rows in DB  : 5  (expected 5)
  bookedSpots counter      : 5/5
  rejections               : { SPOTS_FULL: 25 }
  PASS

Test 2 — double-booking protection (1 user, 8 simultaneous requests)
  registration rows in DB : 1  (expected 1)
  bookedSpots counter     : 1  (expected 1)
  PASS
```

---

## Environment variables

`backend/.env` (copy from `.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/feedants` | Database connection |
| `MONGO_MAX_POOL_SIZE` | `20` | Bounded pool so a fleet of instances can't exhaust MongoDB |
| `JWT_SECRET` | dev value | **Must** be set in production; the app refuses to boot with the default |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CORS_ORIGINS` | `*` | Comma-separated allowlist |
| `DEFAULT_LANGUAGE` / `SUPPORTED_LANGUAGES` | `en` / `en,hi` | Localisation |
| `PAYMENT_PROVIDER` | `mock` | `mock` or `razorpay` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | — | Only needed for the real gateway |
| `UPLOAD_DIR` / `MAX_UPLOAD_BYTES` | `backend/uploads` / 100MB | Submission storage |

Mobile: `EXPO_PUBLIC_API_URL` (optional — auto-detected in development).

---

## API reference

All responses use one envelope: `{ success: true, data }` or
`{ success: false, error: { code, message, details? } }`. The client switches on the stable
`code`, never on message text.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | Liveness + DB status |
| `POST` | `/api/auth/signup` | — | Create account |
| `POST` | `/api/auth/login` | — | Obtain JWT |
| `GET` | `/api/auth/me` | ✔ | Current user |
| `PATCH` | `/api/auth/me/language` | ✔ | Persist language preference |
| `GET` | `/api/competitions` | optional | Paginated list |
| `GET` | `/api/competitions/:idOrSlug` | optional | **Everything the details screen renders** |
| `POST` | `/api/competitions/:id/registration-order` | ✔ | Create a payment order |
| `POST` | `/api/competitions/:id/register` | ✔ | Register (books a spot) |
| `DELETE` | `/api/competitions/:id/register` | ✔ | Cancel before the deadline |
| `POST` | `/api/competitions/:id/submission` | ✔ | Attach/replace a submission |
| `POST` | `/api/uploads` | ✔ | Upload submission media |

`GET /api/competitions/:idOrSlug` accepts `?lang=en|hi` and works signed-out. When a token is
present it additionally returns the viewer's own registration and CTA:

```jsonc
{
  "lifecycle": {
    "stage": "REGISTRATION_OPEN",
    "registration": { "isOpen": true, "hasEnded": false, "msUntilEnd": 109649962,
                      "isAcceptingRegistrations": true },
    "submission":   { "hasStarted": true, "isOpen": true, "msUntilEnd": 1728000000 },
    "results":      { "isDeclared": false, "msUntilDeclared": 1900800000 },
    "capacity":     { "totalSpots": 20, "bookedSpots": 1, "spotsLeft": 19,
                      "isFull": false, "filledPercent": 5 }
  },
  "viewer": {
    "isAuthenticated": true,
    "isRegistered": true,
    "registration": { "status": "registered", "paymentStatus": "paid", "hasSubmitted": false },
    "cta": { "action": "UPLOAD_SUBMISSION", "enabled": true, "reason": null }
  }
}
```

Every registration write returns this **same shape**, so a successful action refreshes the
whole screen in one round trip instead of triggering a second fetch.

### Error codes

| Code | HTTP | Meaning |
| --- | --- | --- |
| `ALREADY_REGISTERED` | 409 | Active registration exists |
| `SPOTS_FULL` | 409 | Last spot taken |
| `REGISTRATION_CLOSED` / `REGISTRATION_NOT_OPEN` | 422 | Outside the registration window |
| `SUBMISSION_NOT_OPEN` / `SUBMISSION_CLOSED` | 422 | Outside the submission window |
| `NOT_REGISTERED` | 403 | Submitting without registering |
| `PAYMENT_INCOMPLETE` | 402 | Unpaid entry may not submit |
| `CANCELLATION_CLOSED` | 422 | Too late to cancel |
| `VALIDATION_ERROR` | 400 | Zod rejected the payload (`details` lists fields) |
| `RATE_LIMITED` | 429 | Throttled |

---

## Data model

**User** — name, email (unique), password hash, `preferredLanguage`, `referralCode`, `referredBy`.

**Competition** — the whole screen as one aggregate: localised `title`/`content`/`disclaimer`,
`tags`, `prizePool`, `entryFee`, `capacity { totalSpots, bookedSpots }`, embedded `judge`,
`dates { registrationOpensAt, registerBefore, submissionStarts, submissionEnds, resultDate }`,
`rewards[]`, `previousWinners[]`, `media`, `policies`, `referral`, `status`.

Judge, rewards and previous winners are **embedded**, not referenced: they are always read with
the competition, never queried independently, and are bounded in size — so embedding turns the
whole screen into a single document read.

**Registration** — the join between user and competition: `status`, embedded `payment`,
embedded `submission { fileUrl, version, submittedAt }`, `idempotencyKey`.

### Indexes

| Collection | Index | Why |
| --- | --- | --- |
| Competition | `{ status, dates.registerBefore }` | Listing feed |
| Competition | `{ slug }` unique | Slug lookups |
| Registration | `{ competition, user }` unique **partial** on `status: 'registered'` | Prevents double-booking while still allowing re-registration after cancelling |
| Registration | `{ competition, idempotencyKey }` unique **partial** on `$type: 'string'` | Deduplicates retries |
| Registration | `{ competition, payment.status, submission.submittedAt }` | Judging feed |

> Both dedupe indexes are **partial**, not sparse. In a compound *sparse* index a document is
> still indexed when only one field is present, so every row with a `null` key would collide
> with every other. That bug was real — the concurrency test caught it, and the partial filter
> fixed it.

---

## How the screen stays dynamic

The React Native layer holds **no business rules**. The server computes the lifecycle and
resolves the one action the viewer may take; the app renders that decision.

```
domain/competitionLifecycle.js   pure functions: windows, capacity, stage, CTA
domain/registrationPolicy.js     pure guards: can register / submit / cancel
repositories/                    all Mongoose access
services/                        orchestration + compensation
presenters/                      localisation + response shaping
controllers/ + routes/           HTTP only
```

Because `evaluate()` and `resolveCta()` are pure and dependency-free, the same rules drive the
read path, the write path and the tests — the button on screen can never disagree with what the
API will accept.

Registration and submission are modelled as **two independent windows**, not one linear enum,
because in the design they legitimately overlap: submissions open 6 Aug while registration runs
until 10 Aug. A single status field would have been wrong.

The countdown recomputes from the target timestamp on every tick rather than decrementing, so it
self-corrects after the app is backgrounded or the JS thread stalls. When it reaches zero it
triggers a refetch and lets the **server** decide the new state — the client never promotes
itself out of a deadline.

---

## Concurrency and data consistency

Assume thousands of users tapping *Register* on the last spot at once. Two things must never
happen: overselling, and one user booking twice. Both are enforced by the **database**, not by
application-level checks that would race.

**1. Overselling — one conditional atomic update.** Every precondition lives in the update
filter, so check and write are a single atomic operation:

```js
Competition.findOneAndUpdate(
  { _id, status: 'published',
    'dates.registerBefore': { $gt: now },
    $expr: { $lt: ['$capacity.bookedSpots', '$capacity.totalSpots'] } },
  { $inc: { 'capacity.bookedSpots': 1 } },
  { new: true }
)
```

A `null` result means the database refused. A read-then-write would let two requests both see
19/20 and both commit.

**2. Double-booking — a unique partial index.** The loser of a race gets a duplicate-key error
instead of a second row.

**3. Counter drift — compensation.** If the row insert fails after the seat was taken, the seat
is released. The `bookedSpots` counter therefore cannot drift from the number of rows.

**Why a denormalised counter at all?** Counting registrations per request would mean a
`countDocuments` on every page view. The counter makes the read a single document fetch and the
write a single atomic increment — and the compensation step is what keeps it honest.

**Why not transactions?** Multi-document transactions need a replica set; a standalone local
MongoDB has none. The conditional-increment-plus-unique-index approach is correct on **both**,
and avoids transaction overhead on the hottest path.

**Idempotency.** Clients send an `idempotencyKey`; a retry after a lost response returns the
existing registration instead of attempting a second booking — the realistic mobile failure mode.

---

## Validations and edge cases

Handled explicitly, each with a distinct error code:

- Registering twice, after the deadline, for a full competition, or for a draft/archived one
- Registering for a competition that hasn't opened registration yet
- Submitting without registering, before the window opens, after it closes, or while unpaid
  (the screen's own disclaimer: only paid participants are judged)
- Replacing an existing submission — versioned rather than silently overwritten
- Cancelling after the deadline; cancelling frees the spot and allows re-registration
- A deadline elapsing while the screen is open — the countdown refetches instead of guessing
- Signed-out viewers — the screen renders fully, and the CTA carries `requiresAuth`
- Malformed ids, oversized uploads, unsupported MIME types, expired/invalid tokens
- `bookedSpots` can never exceed `totalSpots` or go negative (schema + guarded updates)

---

## Assumptions

1. **Payments are mocked.** The design shows Razorpay, but no keys were provided. The gateway
   sits behind a port (`services/payments/paymentGateway.js`) with a mock adapter and a
   signature-verifying Razorpay adapter stubbed; switching is one env var. Registration is
   treated as paid on success, which is what the "paid participants only" disclaimer requires.
2. **Auth was not specified**, so it is deliberately minimal — email/password + JWT — enough to
   make "user participation state" real without becoming the focus of the module.
3. **Seed dates are relative to seed time** so the countdown is live and reviewable. The
   literal design dates (Aug–Sep 2026) are available via `--literal-dates`.
4. **The ENG/हिंदी toggle is real**, so competition content is stored per language and served
   translated; the app only owns its own static chrome labels.
5. **Uploads go to local disk** behind a storage adapter. No cloud credentials were available.
   Seed images and videos point at third-party placeholder hosts (`picsum.photos`,
   `media.w3.org`) — they are demo stand-ins, not project assets, and a public host can
   revoke access at any time. If a thumbnail or play button fails, swap the URLs in
   `backend/src/seed/competitionData.js` and reseed; nothing in the app logic depends on them.
6. **"Hear From Our Users" and the ad slot** are rendered as the design shows them but are not
   backed by endpoints — neither has defined data in the brief, and inventing schemas for them
   would have been scope I couldn't justify.

---

## Technical decisions

- **Server-authoritative CTA.** The single highest-leverage decision. Putting
  `viewer.cta.action` in the payload means deadline, capacity and payment rules live in exactly
  one place. The alternative — shipping dates to the client and branching there — produces a
  button that lies whenever the client clock is wrong or data is stale.
- **Layered, dependency-injected-by-module structure.** Controllers do HTTP, services
  orchestrate, repositories own Mongoose, and the domain layer is pure. Swapping the
  persistence layer or unit-testing the rules needs no framework at all.
- **Pure domain functions.** `evaluate()` takes a plain object and an injectable `at` date, so
  any lifecycle state is testable without touching a database or waiting for time to pass.
- **One response envelope and stable error codes.** The app never parses human-readable text.
- **React Query with mutation-seeded cache.** Writes return the full refreshed competition and
  seed the cache directly, so the screen updates from server truth in one round trip. No
  optimistic update can disagree with the server.
- **NativeWind** keeps styling declarative and colocated, with design tokens (`primary`, `ink`,
  `surface`) in `tailwind.config.js` rather than hex values scattered through components.
- **Composable section components.** Each block of the screen is independent and takes only the
  data it renders, so sections can be reordered or reused on other screens.

---

## Trade-offs

| Decision | Gained | Gave up |
| --- | --- | --- |
| Denormalised `bookedSpots` | O(1) reads, atomic booking | Needs compensation logic to stay honest |
| Conditional `$inc` over transactions | Works on standalone Mongo, less overhead | Two-step flow needs an explicit compensating release |
| Embedded judge/rewards/winners | Whole screen in one document read | Editing a judge used across competitions means touching each |
| Localised strings in the document | No join, no second request, atomic edits | Document grows with each new language |
| Computing lifecycle per request | Never stale | Recomputed per read (microseconds — worth it) |
| Local disk uploads | No cloud dependency to review | Not multi-instance safe; needs object storage |
| Minimal auth UI | Focus stayed on the actual module | Not a production sign-up experience |

---

## What I would change for production

- **Object storage with pre-signed uploads** (S3/Cloudinary + CDN) so media never transits the
  API process, replacing the local disk adapter behind the existing interface.
- **Redis** for read-through caching of competition documents (the read is heavily skewed to a
  few hot competitions) and as the rate-limiter store, so limits are shared across instances
  rather than per-process.
- **Real Razorpay integration** with a webhook-driven payment state machine: hold the spot with
  a short TTL reservation, confirm on webhook, and release automatically on timeout. The current
  flow verifies inline, which is simpler but holds the seat only after payment succeeds.
- **An automated test suite** — the domain layer is pure and was built to be unit-tested, and
  the concurrency script should become part of CI rather than a manual command.
- **Observability**: structured request logging with correlation ids, plus metrics on
  registration conflict rate and spot-fill latency — the numbers that reveal contention.
- **A scheduled job** to transition and archive finished competitions, and to reconcile
  `bookedSpots` against registration rows as a safety net.
- **Soft real-time spot counts** over WebSocket so the "19 spots left" figure updates without a
  refresh when a competition is filling quickly.
- **Accessibility and performance passes**: dynamic type, screen-reader labels on every
  interactive element (partially done), and image CDN resizing for winner thumbnails.
