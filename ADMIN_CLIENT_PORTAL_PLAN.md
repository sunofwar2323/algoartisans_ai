# AlgoArtisans — Admin Portal & Client Dashboard Plan

**Document purpose:** Single source of truth for building the internal **Admin Portal** and customer-facing **Client Dashboard** in a **separate folder/repo**, while keeping the current marketing website as the public funnel.

**How to use this file in a new project**

1. Copy `ADMIN_CLIENT_PORTAL_PLAN.md` into your new dashboard folder (or monorepo package).  
2. Copy brand assets listed in §4.8 (logo + agent portraits at minimum).  
3. Paste the CSS variables from §4.3 into `globals.css` / theme tokens.  
4. Follow §4 design rules before inventing new colors or layouts.  
5. Execute phases in §8 (Phase 0 → 4).  

**Related products today**

| Surface | Status | Role |
|---------|--------|------|
| Marketing site (`algoartisans.com`) | Live (static HTML/CSS/JS) | Brand, SEO, workforce story, Start a Project |
| Start a Project intake | Live | Multi-step role hire + Q&A → email |
| Contact / newsletter | Live | General enquiries → FormSubmit |
| AI Workforce HQ + Agent Roster | Live | Marketing / discovery UI |

**Target products (separate folder)**

| Surface | Audience | URL (proposed) |
|---------|----------|----------------|
| Admin Portal | AlgoArtisans team | `app.algoartisans.com/admin` |
| Client Dashboard | Paying / onboarded clients | `app.algoartisans.com/app` |
| Auth | Both | `app.algoartisans.com/login` |

**Core principles**

- Marketing site sells. App stack operates.  
- Build dashboards in a **different folder/repo** — do not fold admin into the static marketing site.  
- Portals must feel like the same brand as the live site: dark navy, cyan accents, glass panels, serif headlines, operational “2030 workforce” UI.  

---

## 1. Vision

AlgoArtisans is an **AI-native technology company**: humans set direction; AI agents execute. Portals should feel like a **2030 workforce operations platform**—same language as the Agent Roster (glass UI, navy/cyan, status, workload, hierarchy)—but backed by real data.

### Admin Portal (internal)
Turn Gmail + spreadsheets into a command center:
- Capture every Start a Project and Contact submission  
- Qualify → propose → win/lose  
- Convert to projects and assign agents/roles  
- Configure agents from intake answers  
- Message clients and track delivery  

### Client Dashboard (external)
Give clients a living view of what they hired:
- Hired AI roles / workforce cards  
- Status, workload, capabilities  
- Project brief (their submitted Q&A)  
- Updates, files, next steps  

---

## 2. Brand foundation (from the live website)

### 2.1 Company
| Field | Value |
|-------|--------|
| Company | **AlgoArtisans** |
| Primary tagline | **Build. Automate. Scale.** |
| Positioning | **Human-led. AI-powered.** |
| Industry | AI, Software Engineering, SaaS, Automation, Research |
| Contact | `algoartisans@gmail.com` |
| Theme color (PWA/browser) | `#070b14` |

### 2.2 Brand idea
AlgoArtisans is not a traditional software agency. It is an AI-native company where **human expertise + AI workforce** design, build, and deploy technology.

The product UI must communicate:
- Engineering excellence  
- Artificial intelligence  
- Software craftsmanship  
- Speed, precision, trust  
- Premium technology  
- Human + AI collaboration  

### 2.3 Voice & microcopy patterns (use in dashboards)
- Operational / system tone: `SYSTEM ONLINE`, `SYSTEM STATUS`, `READY`, `AWAITING INPUT`  
- Eyebrow labels (uppercase, tracked): `Agent roster`, `Client intake`, `Signal feed`  
- CTAs: `Start a Project →`, `Deploy this role →`, `Initialize Project →`  
- Status words: `Online`, `Busy`, `Provisioning`, `Active`, `Paused`  
- SLA-style: “within **2 business days**”  

### 2.4 What to avoid (brand anti-patterns)
- Generic purple-on-white / purple-indigo AI clichés  
- Warm cream + terracotta “AI default” looks  
- Flat single-color boring admin grey with no atmosphere  
- Overuse of glow/neon that feels gamer-cheap  
- Emoji-heavy UI  
- Inter-only / system-default typography with no hierarchy  
- Light mode as default (product is dark-first)  

---

## 3. Current system map (marketing site)

### Public funnel
1. Visitor lands on Home / Workforce / About  
2. Clicks **Start a Project** → multi-step intake (`start-project.html`)  
3. Selects one or more of **14 virtual employee roles** + answers role-specific questions  
4. Submits → FormSubmit email to `algoartisans@gmail.com` (+ browser `localStorage` backup)  
5. Or uses **Contact** for general enquiries  

### Workforce brand layer (5 HQ agents)
| Agent | Role | Portrait file (marketing) |
|-------|------|---------------------------|
| **ATLAS** | AI Project Manager | `images/Atlast.png` |
| **NOVA** | AI Systems Architect | `images/Nova.png` |
| **FORGE** | AI Software Engineer | `images/Forge.png` |
| **VANTA** | AI Sales & Marketing | `images/Vin.png` |
| **FINN** | AI Finance & Operations | `images/Fin.png` |

### Intake role catalog (14 hireable roles)
Accountant/Bookkeeper, Finance Manager, Marketing Specialist, Social Media Manager, Sales/BDR, Customer Support, HR/Recruiter, Project Manager, Data Analyst, Content Writer, Executive Assistant, Operations Manager, IT/Systems Support, Legal/Compliance Assistant  

### Human leadership (About)
| Person | Title | Focus | Photo |
|--------|-------|-------|--------|
| Shreejana Sunuwar | CEO & Strategy | Finance & Operational | `images/shreejana.png` |
| Om | Co-Founder | Technology & Product | `images/om.png` |
| Gautam Sunuwar | Researcher | — | `images/gautam.png` |

### Gaps today
- No durable database of submissions  
- No pipeline/status workflow  
- No client login or project workspace  
- No agent configuration tied to answers  
- FormSubmit is temporary (email-only)  

---

## 4. Design system — pull this into the new dashboard

> Source of truth on the marketing site: `commonStyle.css` (`:root` tokens), plus patterns from `style.css`, `agent-roster.css`, `start-project.css`, `workforce-hq.css`, `motion.css`.

### 4.1 Visual direction
- **Dark-first** navy canvas (`#070b14`)  
- **Glassmorphism** panels: translucent elevated surfaces + blur  
- **Cyan / sky accent** system (not purple)  
- Soft **grid overlays** + radial cyan glows for atmosphere  
- **Serif display** (Lora) for titles; **Inter** for UI/body  
- Rounded pills for buttons; soft large radii for cards  
- Motion: short, purposeful (`cubic-bezier(0.22, 1, 0.36, 1)`), respect `prefers-reduced-motion`  

### 4.2 Backgrounds & atmosphere (copy these recipes)

**Page / app shell background**
```css
background: #070b14; /* --navy */
color: #e8eef7;      /* --text */
```

**Ambient section background (Agent Roster style)**
```css
background:
  radial-gradient(ellipse 70% 50% at 10% 0%, rgba(14, 165, 233, 0.12), transparent 55%),
  radial-gradient(ellipse 50% 40% at 90% 20%, rgba(52, 211, 153, 0.06), transparent 50%),
  #070b14;
```

**Optional grid overlay**
```css
background-image:
  linear-gradient(rgba(56, 189, 248, 0.035) 1px, transparent 1px),
  linear-gradient(90deg, rgba(56, 189, 248, 0.035) 1px, transparent 1px);
background-size: 48px 48px;
mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, black, transparent 75%);
```

**Glass command / card surface**
```css
background: rgba(13, 19, 32, 0.55); /* based on --navy-elevated */
border: 1px solid rgba(148, 163, 184, 0.14);
backdrop-filter: blur(18px);
-webkit-backdrop-filter: blur(18px);
border-radius: 22px;
box-shadow: 0 20px 50px rgba(0, 0, 0, 0.22);
```

**Portrait / media well**
```css
background:
  radial-gradient(ellipse 55% 50% at 50% 30%, rgba(14, 165, 233, 0.22), transparent 70%),
  #0a1220;
border: 1px solid rgba(56, 189, 248, 0.22);
```

### 4.3 CSS variables (paste into new app theme)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:ital,wght@0,500;0,600;1,500&display=swap');

:root {
  /* Surfaces */
  --navy: #070b14;
  --navy-elevated: #0d1320;
  --navy-soft: #121a2b;
  --navy-border: rgba(148, 163, 184, 0.16);

  /* Text */
  --off-white: #f4f6f9;
  --white: #ffffff;
  --muted: #94a3b8;
  --muted-strong: #cbd5e1;
  --text: #e8eef7;

  /* Accent (cyan / sky — brand signature) */
  --accent: #22d3ee;
  --accent-strong: #38bdf8;
  --accent-deep: #0ea5e9;
  --accent-soft: rgba(34, 211, 238, 0.12);
  --accent-glow: rgba(56, 189, 248, 0.22);

  /* Status */
  --success: #34d399;
  --warning: #fbbf24;   /* used for Busy status on roster */
  --danger: #f87171;    /* form errors / failed states */

  /* Geometry */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --radius-xl: 28px;
  --radius-pill: 999px;

  /* Elevation */
  --shadow-sm: 0 8px 24px rgba(0, 0, 0, 0.18);
  --shadow-md: 0 18px 48px rgba(0, 0, 0, 0.28);

  /* Layout */
  --container: 1140px;
  --header-h: 76px;
  --sidebar-w: 260px; /* dashboard addition */

  /* Type */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-serif: 'Lora', Georgia, serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;

  /* Motion */
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}
```

### 4.4 Color usage guide

| Token | Hex / value | Use for |
|-------|-------------|---------|
| `--navy` | `#070b14` | App background, sidebar base |
| `--navy-elevated` | `#0d1320` | Cards, panels, modals |
| `--navy-soft` | `#121a2b` | Nested wells, inputs, hover fills |
| `--navy-border` | `rgba(148,163,184,0.16)` | Default borders |
| `--text` | `#e8eef7` | Primary body text on dark |
| `--muted` | `#94a3b8` | Secondary copy |
| `--muted-strong` | `#cbd5e1` | Labels, stronger secondary |
| `--white` | `#ffffff` | Headings, emphasis |
| `--accent` | `#22d3ee` | Links, eyebrows, active accents |
| `--accent-deep` | `#0ea5e9` | Primary button gradient start |
| `--accent-strong` | `#38bdf8` | Highlights, hover accents |
| `--success` | `#34d399` | Online / done / success |
| `--warning` | `#fbbf24` | Busy / attention |
| `--danger` | `#f87171` | Errors |

**Primary CTA gradient (marketing site)**
```css
background: linear-gradient(135deg, #0ea5e9, #22d3ee);
color: #070b14;
box-shadow: 0 10px 28px rgba(56, 189, 248, 0.22);
```

**Hover CTA**
```css
background: linear-gradient(135deg, #22d3ee, #67e8f9);
```

### 4.5 Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / page titles | **Lora** (`--font-serif`) | 600 | `letter-spacing: -0.025em`; white |
| UI / body | **Inter** (`--font-sans`) | 400–600 | Line-height ~1.65 |
| Eyebrow / meta | Inter | 600 | Uppercase, `letter-spacing: 0.14em`, accent color |
| IDs / system codes | Mono | 400–600 | e.g. `AGENT_01`, `SYSTEM ONLINE` |

**Scale (marketing)**
- Hero / large display: `clamp(2.35rem, 5.2vw, 3.85rem)`  
- Section header: `clamp(1.85rem, 3.6vw, 2.75rem)`  
- Body: `1rem`–`1.05rem`  
- Eyebrow: `~0.78rem`  

**Eyebrow pattern**
- Uppercase accent text  
- Optional leading 1.4rem accent hairline before label  

### 4.6 Components to mirror in the dashboard

#### Buttons
- Shape: **pill** (`border-radius: 999px`)  
- Min height: **48px**  
- **Primary:** cyan gradient, navy text, soft glow shadow  
- **Ghost:** transparent + border; hover → accent-soft fill  
- Hover lift: `translateY(-2px)`  

#### Cards / panels
- Background: `--navy-elevated` or glass rgba  
- Border: `--navy-border`; hover border `rgba(56,189,248,0.35)`  
- Radius: `--radius-lg` (22px) or 18–22px for command bars  
- Hover: slight lift + `--shadow-md`  

#### Inputs
- Background: `--navy-soft` / dark well  
- Border: `--navy-border`  
- Focus: outline `2px solid var(--accent)` offset 3px  
- Labels: muted-strong, small  

#### Status pills
- Online: green border/text (`--success`) + live pulse dot  
- Busy: amber (`--warning`)  
- Neutral meta pill: muted border, uppercase tracked text  

#### Progress / workload
- Track: `rgba(148,163,184,0.16)`  
- Fill: `linear-gradient(90deg, --accent-deep, --accent)`  
- Optional conic ring (Agent Roster)  

#### Navigation (dashboard adaptation)
- Sticky header height ~76px, translucent navy + blur (marketing header pattern)  
- Sidebar: `--navy-elevated`, accent active state, muted inactive links  
- Logo: `Logo-img.png`  

### 4.7 Motion & interaction
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`  
- Card enter: fade + slight `translateY`  
- Live pulse for online indicators (~1.8s)  
- Always support `prefers-reduced-motion: reduce` (disable non-essential animation)  

### 4.8 Brand assets to copy into the new folder

**Required**
| Asset | Path on marketing site | Dashboard use |
|-------|------------------------|---------------|
| Logo | `images/Logo-img.png` | Auth, sidebar, emails |
| Favicon | same logo | App icon |
| Atlas | `images/Atlast.png` | Workforce cards / agent detail |
| Nova | `images/Nova.png` | Workforce cards |
| Forge | `images/Forge.png` | Workforce cards |
| Vanta | `images/Vin.png` | Workforce cards |
| Finn | `images/Fin.png` | Workforce cards |

**Optional (if needed)**
| Asset | Path | Use |
|-------|------|-----|
| Shreejana | `images/shreejana.png` | Admin team / about |
| Om | `images/om.png` | Admin team |
| Gautam | `images/gautam.png` | Admin team |
| Hero art | `img/fh-2x.png`, `img/fh-hq.png` | Marketing only (optional empty states) |

> Tip: optimize agent PNGs for web (they are large). Serve WebP/AVIF in the app when possible.

### 4.9 Graphic motifs allowed in product UI
- Cyan radial glows in corners of shells  
- Faint technical grid (masked, low opacity)  
- Hairline accent underlines / top edge gradients on cards  
- Soft network / node metaphors (already on agent portraits)  
- Hierarchy chips: Human Leadership → Agents → Outcomes  

### 4.10 Breakpoints (from marketing)
| Breakpoint | Behavior |
|------------|----------|
| `< 640px` | Single column cards; compact progress |
| `< 900px` | Collapse side-by-side layouts; mobile nav patterns |
| `≥ 900px` | Desktop nav / split layouts |
| `≥ 980px` | Roster-style main + inspector / detail pane |

Dashboard suggestion: sidebar visible `≥ 980px`; drawer below.

### 4.11 Reference UI on the live site (study these)
| Pattern | Where |
|---------|--------|
| Design tokens | `commonStyle.css` |
| Agent Roster glass dashboard | `workforce.html` + `agent-roster.css` |
| Multi-step intake + progress rail | `start-project.html` + `start-project.css` / `.js` |
| HQ agent detail panel + portrait | `workforce.html` + `workforce-hq.css` |
| Buttons / type / cards | `commonStyle.css` |
| Page transition / system chrome | `motion.css` |

---

## 5. Product split & information architecture

```
www.algoartisans.com          → Marketing (keep current static site)
app.algoartisans.com/login    → Auth
app.algoartisans.com/admin/*  → Admin Portal   ← build in NEW folder
app.algoartisans.com/app/*    → Client Dashboard ← same new folder
```

### Suggested new folder layout
```
algoartisans-app/                 # NEW folder / repo
  ADMIN_CLIENT_PORTAL_PLAN.md     # this file
  public/
    brand/
      Logo-img.png
      agents/
        Atlast.png
        Nova.png
        Forge.png
        Vin.png
        Fin.png
  src/
    app/
      (auth)/login/...
      admin/...
      app/...                     # client portal
      api/intake|contact/...
    styles/
      tokens.css                  # §4.3 variables
      globals.css
```

### Admin navigation
- Command Center  
- Project Requests  
- Leads  
- Projects  
- Workforce / Agents  
- Clients & Organizations  
- Messages  
- Files  
- Settings  

### Client navigation
- Home  
- My Workforce  
- Project Brief  
- Messages  
- Files  
- Account  

---

## 6. Recommended tech stack

| Layer | Recommendation |
|-------|----------------|
| App | Next.js (App Router) on Vercel |
| Auth | Clerk or Auth0 (`super_admin`, `ops`, `founder`, `client`) |
| DB | Neon Postgres or Supabase |
| Email | Resend / Postmark (replace FormSubmit) |
| Files | Vercel Blob / S3 |
| UI | Tokens from §4 + optional shadcn restyled to brand |
| Optional | Google Sheets export only |

---

## 7. Data model (core)

```
users
organizations
memberships

leads
project_requests
project_request_roles
project_request_answers

projects
project_agents
agent_catalog          # 14 hire roles
hq_agents              # Atlas–Finn brand layer + portrait paths

messages / threads
files
activity_events
```

**Request statuses:** `new → reviewing → qualified → proposal_sent → won | lost | archived`  
**Project:** `draft → active → paused → completed`  
**Deployed agent:** `provisioning → active → paused → retired`  

---

## 8. Phase-wise execution

### Phase 0 — Foundations  
**Duration:** 1–2 weeks · **Folder:** new `algoartisans-app`

#### Goals
App shell + durable intake data + brand tokens applied.

#### Work items
1. Create Next.js app in a **separate folder/repo**.  
2. Copy this plan + brand assets (§4.8).  
3. Add `tokens.css` from §4.3; dark shell background.  
4. Configure Vercel + `app.algoartisans.com`.  
5. Postgres + ORM; auth with admin-only first.  
6. APIs: `POST /api/intake`, `POST /api/contact` (DB first, then email).  
7. Seed agent catalog from marketing intake questions.  
8. Point marketing forms to new APIs.  

#### Exit criteria
Real Start a Project submission is in DB with contact + roles + Q&A; app UI already looks AlgoArtisans (navy/cyan).

---

### Phase 1 — Admin Portal MVP  
**Duration:** 2–3 weeks  

#### Screens
1. Login (branded)  
2. Command Center (counts, new requests, availability)  
3. Project Requests list + filters  
4. Request detail (contact, roles, Q&A, notes, status, owner)  
5. Leads inbox  
6. Convert request → Project  

#### Exit criteria
Ops processes intake without digging through Gmail for answers.

---

### Phase 2 — Client Dashboard MVP  
**Duration:** 2–3 weeks  

#### Screens
1. Client Home  
2. **My Workforce** (Agent Roster–style cards + portraits from §4.8)  
3. Project Brief  
4. Messages  
5. Files  

#### Flows
Won request → Project → invite client → client sees workforce.

#### Exit criteria
One real client sees hired roles, brief, and at least one message/file.

---

### Phase 3 — Ops depth  
**Duration:** 3–4 weeks  

- Agent configuration checklists from intake answers  
- Live hierarchy strip  
- Workload board  
- Status emails / digests  
- Audit log  

#### Exit criteria
Configured agents + workload + auditable project history.

---

### Phase 4 — Scale  
Billing (Stripe), self-serve add-role, funnel analytics, exports, multi-seat orgs, real agent telemetry (when ready).

---

## 9. Screen checklist

### Admin
| # | Screen | Phase |
|---|--------|-------|
| A1 | Auth / login | 0 |
| A2 | Command Center | 1 |
| A3 | Project Requests list | 1 |
| A4 | Project Request detail | 1 |
| A5 | Leads list/detail | 1 |
| A6 | Projects list/detail | 1–2 |
| A7 | Convert request → project | 1 |
| A8 | Client org + invite | 2 |
| A9 | Agent config / checklist | 3 |
| A10 | Workload board | 3 |
| A11 | Settings | 3 |

### Client
| # | Screen | Phase |
|---|--------|-------|
| C1 | Login / invite accept | 2 |
| C2 | Home | 2 |
| C3 | My Workforce | 2 |
| C4 | Project Brief | 2 |
| C5 | Messages | 2 |
| C6 | Files | 2 |
| C7 | Account | 2–3 |
| C8 | Add role | 4 |

---

## 10. Integration with marketing site

| Marketing asset | Portal use |
|-----------------|------------|
| `start-project.html` | Keep UX; submit to `/api/intake` |
| Contact form | `/api/contact` |
| Agent portraits | My Workforce + admin agent views |
| Agent Roster UI | Visual language for client cards |
| This plan file | Carry into new folder as build bible |

**DNS:** `www` → marketing · `app` → dashboard app · CORS allow marketing origin for public APIs.

---

## 11. Security basics

1. No open admin routes.  
2. Org-scoped client queries.  
3. Secrets in env vars.  
4. Intake = PII.  
5. Rate-limit public APIs; honeypot + server validation.  
6. Audit admin changes.  
7. DB backups enabled.  

---

## 12. Team ownership

| Area | Owner |
|------|--------|
| Product / client copy | Shreejana (CEO & Strategy) |
| Architecture / auth | Om / tech lead |
| Agent catalog / Q&A | Gautam (Research) + Ops |
| Daily request handling | Ops / sales |
| Brand UI fidelity | Whoever maintains marketing visuals |

---

## 13. 90-day metrics

| Metric | Target |
|--------|--------|
| Intake stored in DB | 100% |
| First admin review | &lt; 1 business day |
| Admin works without email for Q&A | Yes |
| Live client dashboard | ≥ 1 org |
| Client sees roles + brief | Yes |
| Marketing SEO regression | None |

---

## 14. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Rebuilding marketing site | Keep separate; new folder for app |
| Losing brand consistency | Enforce §4 tokens before custom CSS |
| FormSubmit lock-in | Phase 0 API = source of truth |
| Scope creep | Phase gates |
| HQ agents vs 14 hire roles confusion | Catalog types: `hq_agent` vs `hire_role` |
| Huge PNGs | Compress / modern formats |

---

## 15. Immediate next actions

1. Create new folder/repo: `algoartisans-app` (or similar).  
2. Copy **this MD file** + brand assets (§4.8).  
3. Scaffold Next.js; paste §4.3 tokens.  
4. Choose Clerk + Neon (or equivalents).  
5. Phase 0: schema + intake API + branded shell.  
6. Wire marketing `start-project` to API.  
7. Phase 1: Admin inbox.  

---

## 16. Open decisions

- [ ] Mapping 14 hire roles ↔ 5 HQ agents (story vs ops)  
- [ ] Admin seats for v1  
- [ ] Keep “2 business days” SLA copy?  
- [ ] Clients see Atlas/Nova names or only hire-role titles?  
- [ ] Billing in Phase 4 or earlier?  

---

## Document control

| Field | Value |
|-------|--------|
| Created | 2026-09-07 |
| Updated | 2026-09-07 — added full brand/design system for separate dashboard folder |
| Marketing site path | `/Users/macbookair/Downloads/Algoartisans/Tech website` |
| Product | AlgoArtisans Admin + Client portals |
| Status | Planning — ready for Phase 0 in a **new folder** |
| Email | algoartisans@gmail.com |

---

*Pull this file into your new dashboard project and treat §4 as the design contract. Build Admin + Client against those tokens so the product feels continuous with algoartisans.com.*
