<div align="center">

# CampusTrail
<strong>Peer travel hub for campus communities – rent gear, plan itineraries, find companions, build trust.</strong><br/>
<sub>Polymorphic reviews • Deposit lifecycle • Matching heuristics • Theming system</sub>

</div>

---

## ✨ Snapshot (Sep 2025)

| Domain | Status | Notes |
| ------ | ------ | ----- |
| Gear Marketplace | ✅ | Draft → Publish → Archive, buffered availability, deposit hold/capture/release |
| Itineraries | ✅ | Capacity, joins, interests, style tags, matching heuristic |
| Companion Requests | ✅ | Tag-based + itinerary matching |
| Polymorphic Reviews | ✅ | Gear / Itinerary / Companion / User (rating + body + title) |
| Orders | ✅ | Order + OrderItem snapshot for history |
| Disputes | ✅ (API) | Rental‑level damage / issue claims; simple resolution flow |
| Auth (OTP → JWT) | ✅ | Rate limiting, email fallback (temp in‑memory) |
| MSSQL Event Logging | ✅ (Optional) | Graceful timeout & disable env flag |
| UI Theme System | ✅ | Brand tokens, semantic text tiers, unified buttons |
| Dark Mode | ✅ | Token driven (no hardcoded slate leftovers) |
| Dispute Frontend | ⏳ | Backend ready – UI pending |
| Orders Frontend Surfacing | ⏳ | API live – navigation integration pending |
| Review Filtering / Aggregation Cache | ⏳ | Planned optimization |

---

## 🚀 Why CampusTrail?
Students already coordinate informally for trips, gear lending, and planning. CampusTrail formalizes this with:
- Trusted rentals (deposits + dispute channel)
- Shared itineraries & companion matching
- Cross‑context reputation (polymorphic reviews)
- Transparent availability (buffered scheduling)
- A lightweight, hackable codebase for experimentation

---

## 🧱 Architecture Overview

Monorepo style (backend + frontend) with a pragmatic, incremental approach:

```
Client (React + Tailwind + Theme Tokens)
	↓ (REST / JSON)
Express API (TypeScript, Zod validation)
	↓
Prisma ORM (SQLite dev; Postgres-ready) ──> Optional MSSQL Event Log Sink
```

Key flows: Auth (OTP → JWT), Gear rental lifecycle, Deposit transitions, Matching heuristics, Polymorphic review creation, Order snapshots.

---

## 📂 Repository Structure

## Repository Structure (Current)

```
campustrail/
├─ README.md
├─ scripts/
│  └─ run-all.ps1                      # Convenience script to start backend + frontend
├─ infrastructure/                     # (Empty placeholder for future IaC / deploy configs)
├─ backend/
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ .env                             # DATABASE_URL, PORT
│  ├─ prisma/
│  │  ├─ schema.prisma                 # Full data model (User, GearItem, GearRental, etc.)
│  │  ├─ migrations/                   # Prisma migration history (if generated)
│  │  ├─ dev.db                        # SQLite dev database
│  │  └─ seed.ts                       # (Optional) seed script
│  └─ src/
│     ├─ server.ts                     # All Express routes (monolith style)
│     └─ mssql.ts                      # MSSQL logging helper (graceful disable / timeout)
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ tailwind.config.cjs
│  ├─ postcss.config.cjs
│  └─ src/
│     ├─ main.tsx                      # App bootstrap (Toast provider wrapper)
│     ├─ App.tsx                       # View router + sample data + state
│     ├─ global.css                    # Base & Tailwind layers
│     ├─ styles/                       # (Design tokens / extra styles)
│     ├─ lib/                          # Utility functions (e.g., cn helper)
│     └─ components/
│        ├─ Navbar.tsx                 # Navigation + cart badge
│        ├─ ProductList.tsx            # Grid renderer
│        ├─ ProductCard.tsx            # Gear/product card UI
│        ├─ GearManager.tsx            # Manage gear (publish/archive, deposits, ratings)
│        ├─ ReviewPanel.tsx            # Polymorphic review submit/list
│        ├─ ItineraryCard.tsx          # Itinerary display card
│        ├─ CompanionCard.tsx          # Companion request display card
│        ├─ AuthForm.tsx               # Mock auth (OTP style placeholder)
│        └─ ToastProvider.tsx          # Global toast system
└─ node-v22.19.0-x64.msi               # Node installer (local convenience)
```

Additional UI sections (runtime views): `manage-gear`, `manage-itineraries`, `manage-companions`, `reviews`, `orders` (pending surface).

MSSQL event logging (optional) writes structured rows to `CampusTrailLogs.dbo.EventLog`. Disable with `LOG_DISABLE_MSSQL=1`.

---

## 🗄 Data Model (Highlights)

| Entity | Purpose | Notable Fields / Enums |
| ------ | ------- | ---------------------- |
| User | Actor / owner / renter | email, name |
| GearItem | Rentable asset | status DRAFT/PUBLISHED/ARCHIVED, bufferHours, depositAmount |
| GearRental | Rental instance | status REQUESTED→APPROVED→IN_PROGRESS→COMPLETED, depositStatus |
| Payment | Deposit / fee tracking | type DEPOSIT/RENTAL_FEE/ADJUSTMENT, status transitions |
| RentalDispute | Damage / issue | status OPEN→...→RESOLVED_* / REJECTED |
| Itinerary | Trip plan | capacity, style, interests |
| CompanionRequest | Travel companion search | interests, style |
| Review | Polymorphic trust object | One foreign key among gearItemId / itineraryId / companionRequestId / targetUserId |
| Order / OrderItem | History snapshot | Immutable line item data |

Polymorphic design centralizes moderation & future reputation scoring.

---

## 🧪 Core Workflows

### Gear Rental & Deposits
1. Draft gear created
2. Publish exposes to renters
3. Rental requested (buffer conflict detection)
4. Approve → pickup → IN_PROGRESS
5. Return: release or (after dispute) capture deposit
6. Dispute path adjusts deposit outcome

### Availability Buffer Logic
Each rental window is virtually extended by `bufferHours` on both ends to prevent tight turnover collisions (supports `DAY` & precise modes).

### Companion & Itinerary Matching
Heuristic score (0–100): destination match + temporal overlap + style similarity + shared interest tags.

### Reviews
Single-target invariant (exactly one foreign key) ensures clarity & reliable aggregation.

---

## 🖌 Design System (Frontend)

| Category | Tokens / Classes | Description |
| -------- | ---------------- | ----------- |
| Color Vars | `--brand`, `--accent`, `--brand-surface`, `--brand-border`, `--brand-text`, `--brand-text-soft`, `--brand-text-faint` | Light & dark resolved via CSS variables |
| Text Tiers | `text-brand-text`, `text-soft`, `text-faint` | Hierarchy & contrast (WCAG‑minded) |
| Buttons | `btn-brand`, `btn-outline`, `btn-ghost`, `btn-danger` | Unified sizing, radii, transitions |
| Surfaces | `card`, `glass-card`, `surface-card` | Depth & elevation semantics |
| Feedback | `badge`, `callout`, toast system | Status & ephemeral messaging |
| Motion | Subtle fade / hover scale | Framer Motion where impactful |
| Dark Mode | Prefers-color-scheme + class toggle | Pure variable swap (no per-class duplication) |

Principles: semantic > raw palette, minimal variants, accessible contrast, graceful dark mode parity.

---

## 🛠 Tech Stack

**Backend**: Node.js, Express, TypeScript, Prisma (SQLite dev), Zod, (optional) MSSQL logging, Nodemailer.

**Frontend**: React 18, Vite, TypeScript, TailwindCSS (token layer), Framer Motion, lucide-react, custom toasts.

**Auth**: Email OTP → JWT (Bearer) + dev `x-user-email` override.

---

## ⚡ Quick Start (Windows PowerShell)

Prerequisites: Node 18+ (tested on 22). Clone repo then:

```powershell
# Backend deps
cd backend
npm install

# Frontend deps
cd ..\frontend
npm install

# Push (sync) Prisma schema (SQLite dev)
cd ..\backend
npx prisma db push

# (Optional) seed
npx ts-node prisma/seed.ts

# Run both (concurrent helper)
cd ..\scripts
./run-all.ps1
```

Manual (separate terminals): build & run backend (`npm run dev` or `ts-node src/server.ts`) and start frontend (`npm run dev`).

URLs:
- Backend: http://localhost:4000/health
- Frontend: http://localhost:5173

---

## 🔌 API Glance

---

## 🔐 Environment Variables (Backend)

| Group | Key (examples) | Purpose |
| ----- | -------------- | ------- |
| Core | `PORT`, `DATABASE_URL`, `JWT_SECRET` | Server + DB + signing |
| OTP/Auth | `OTP_SEND_COOLDOWN_MS`, `OTP_MAX_PER_WINDOW`, `OTP_MAX_VERIFY_ATTEMPTS`, `OTP_LOCK_MINUTES` | Rate / security |
| Email | `SMTP_SERVICE` or `SMTP_HOST` + creds, `TEMP_EMAIL_MODE`, `MAIL_FROM` | Delivery or mock |
| Logging | `MSSQL_CONN`, `LOG_DISABLE_MSSQL`, `MSSQL_CONN_TIMEOUT_MS` | Event sink control |
| Rentals | `RENTAL_BUFFER_HOURS` | Availability spacing |
| Misc | `PUBLIC_BASE_URL` | Future link gen |

Frontend: `VITE_API_BASE` (preferred), `VITE_API_URL` (legacy fallback).

---

## 🔍 Validation & Quality

- TypeScript strict end‑to‑end
- Zod request payload validation
- Graceful logging fallback (timeouts won’t block requests)
- Planned: unit tests (buffer overlap), integration tests, CI pipeline

---

## 🗺 Roadmap

### Recently Landed
- Orders + OrderItems
- Companion request review support
- MSSQL logging fallback / disable logic
- Unified theme tokens & button variants
- OTP rate limiting + timeout safeguards

### Short Term
- Orders surfacing in UI nav
- Dispute management panel
- Review filtering & caching layer
- Standardized pagination metadata

### Mid Term
- Postgres migration (replace `db push` with migrations)
- File upload pipeline (S3/Blob) for gear photos
- Automated test suite + CI

### Long Term
- Recommendation engine (interests + history)
- Reputation scoring (reviews + disputes)
- Stripe (true deposit holds & charges)
- Messaging / notifications layer

---

## 🤝 Contributing

1. Branch: `feat/...`, `fix/...`, `chore/...`
2. Keep commits atomic (Conventional style encouraged)
3. Update docs for new endpoints/components
4. Provide run/test notes in PR (once test suite exists)

---

## 📄 License

Academic prototype – license TBD. Treat as private unless explicitly opened.

---

Have feedback or ideas? Open an issue / start a discussion.

---

<sub>Made for iterative experimentation – expect sharp edges.</sub>

## Backend Technology Stack

- Node.js + Express
- Prisma ORM (SQLite dev; ready for Postgres migration)
- Zod for input validation
- Auth: Email OTP -> JWT (header `Authorization: Bearer <token>` OR fallback `x-user-email` in dev)
- Nodemailer (Gmail / custom SMTP / Ethereal test / TEMP_EMAIL_MODE)
- TypeScript throughout
- Optional MSSQL logging (non-blocking, disable flag)

## Frontend Technology Stack

- React 18 + Vite
- TypeScript + TailwindCSS (design tokens & utility patterns)
- Framer Motion (animations), lucide-react icons
- Custom ToastProvider (ARIA friendly, auto-dismiss)

## Quick Start (Windows PowerShell)

Prerequisites: Node.js 18+ (tested on Node 22). From repo root:

1. Install backend deps:
	cd backend; node .\node_modules\npm\bin\npm-cli.js install
2. Install frontend deps:
	cd ..\frontend; node ..\backend\node_modules\npm\bin\npm-cli.js install
3. Generate / sync schema:
	cd ..\backend; node .\node_modules\prisma\build\index.js db push
4. (Optional) Seed data:
	node .\node_modules\ts-node\dist\bin.js .\prisma\seed.ts
5. Run (script):
	..\scripts\run-all.ps1

Manual run (if script blocked):
```
node .\backend\node_modules\typescript\lib\tsc.js -p .\backend\tsconfig.json
node .\backend\dist\src\server.js
node .\frontend\node_modules\vite\bin\vite.js
```
Backend: http://localhost:4000/health
Frontend: http://localhost:5173

## Core Domain Workflows

### Gear Rental & Deposits
1. Owner creates gear (status DRAFT)
2. Owner publishes gear (status PUBLISHED)
3. Renter requests rental (buffer-aware conflict detection)
4. Owner approves -> renter can pickup -> rental enters IN_PROGRESS
5. Return confirms completion; deposit can be released or (post-dispute) captured
6. Dispute may be opened anytime after pickup (damage/issue) and resolved by owner (temp policy)

### Availability & Buffer Logic
Each rental window expanded by bufferHours (default 12) on both ends; overlapping (buffered) interval blocks new rentals. Modes:
- DAY: normalized to whole-day boundaries
- PARTIAL: respects exact timestamps

### Matching (Itineraries <-> Companion Requests)
Heuristic score (0–100) combines destination match, overlap ratio, style match, shared interests.

### Reviews
Endpoint accepts exactly one target (gearItemId | itineraryId | targetUserId). Ratings 1–5; list endpoints pageable. Gear average rating surfaced client-side by aggregating fetched reviews.

## Notable Endpoints (Grouped)

Auth:
- POST /auth/request-otp (rate limited)
- POST /auth/verify-otp (returns JWT)

Gear:
- POST /gear (create DRAFT)
- POST /gear/:id/publish | /gear/:id/archive
- GET /gear (query availability window optional)
- GET /gear/:id/availability
- POST /gear/:id/rent (request rental)

Rental lifecycle:
- POST /rentals/:id/approve
- POST /rentals/:id/pickup
- POST /rentals/:id/return

Deposits & disputes:
- POST /rentals/:id/hold-deposit
- POST /rentals/:id/capture-deposit
- POST /rentals/:id/release-deposit
- POST /rentals/:id/disputes
- POST /disputes/:id/resolve

Itineraries:
- POST /itineraries
- GET /itineraries (pagination + filtering)
- GET /itineraries/:id
- POST /itineraries/:id/join
- POST /itinerary-joins/:id/approve | /itinerary-joins/:id/reject
- POST /itineraries/:id/interests
- GET /itineraries/:id/matches

Companion Requests:
- POST /companion-requests
- GET /companion-requests (& filters)
- GET /companion-requests/:id
- POST /companion-requests/:id/interests
- GET /companion-requests/:id/matches

Reviews:
- POST /reviews
- GET /reviews (filter by gearItemId | itineraryId | companionRequestId | targetUserId)

Orders:
- POST /orders (create order from array of gear line items)
- GET /my/orders (list user order history)

## Environment Variables (Backend Key Set)

Core:
- PORT (default 4000)
- DATABASE_URL (SQLite dev)  
- JWT_SECRET

OTP & Auth:
- OTP_SEND_COOLDOWN_MS, OTP_MAX_PER_WINDOW, OTP_MAX_VERIFY_ATTEMPTS, OTP_LOCK_MINUTES
- DEV_OTP_PREVIEW=1 (show preview URL)
- TEMP_EMAIL_MODE=1 (in-memory email capture, no outbound SMTP)

Email (choose service or host):
- SMTP_SERVICE=gmail (with SMTP_USER / SMTP_PASS) OR
- SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_SECURE
- MAIL_FROM (override display)
- EMAIL_SEND_TIMEOUT_MS (fail fast on slow SMTP)

Logging (MSSQL optional):
- MSSQL_CONN (connection string) OR discrete MSSQL_SERVER / MSSQL_DB / MSSQL_USER / MSSQL_PASSWORD
- LOG_DISABLE_MSSQL=1 (skip logging)
- MSSQL_CONN_TIMEOUT_MS

Other:
- RENTAL_BUFFER_HOURS (default 12)
- PUBLIC_BASE_URL (share links)

Frontend:
- VITE_API_BASE (preferred) or VITE_API_URL (legacy fallback)

## Frontend Highlights

- `GearManager`: create/publish/archive gear, fetch & compute average ratings, deposit actions
- `ReviewPanel`: submit & list reviews (context selector scaffold)
- `ProductList` / `ProductCard`: display gear with rating badges
- `ToastProvider`: global ephemeral feedback
- `Navbar` view switching (manage-gear, reviews, etc.)

## Quality & Validation

- TypeScript strict across backend & frontend
- Zod validates inbound create/update payloads (gear, itineraries, companion requests, reviews)
- Buffer-based conflict detection unit-test ready (tests not yet implemented)

## Roadmap

Recently completed:
- Orders persistence & endpoints
- Companion request reviews & schema migration
- MSSQL logging graceful disable & timeout logic
- Tailwind config + design tokens
- run-all.ps1 launcher (health wait, env injection)
- OTP rate limiting & email timeout safeguards

Short-term next:
- Orders UI in frontend profile
- Dispute management UI
- Review filtering / aggregation caching
- Pagination & error envelope standardization

Mid-term:
- Postgres migration & Prisma migrations (replace db push)
- File/image upload pipeline (S3/Blob) for gear photos (currently URL placeholders)
- Automated tests (Vitest/Jest) + CI
- Pagination metadata standardization across all list endpoints
- Normalized error envelope (code, message, details)

Long-term:
- Recommendation engine (gear & itineraries) based on interests/history
- Reputation score aggregation (weighted reviews + dispute outcomes)
- Payment gateway integration (Stripe) for true deposit holds & rental fees
- Messaging / notifications layer

## Contributing

1. Create feature branch (feat/..., fix/..., chore/...)
2. Keep commits atomic (Conventional Commits style)
3. Add/update documentation for new endpoints/components
4. Open PR with concise summary + test evidence (when tests exist)

## License

Internal academic project (license TBD). Treat as proprietary unless specified.

---
Questions or ideas? Open an issue or start a discussion.
