# Förseningskartan — UX Prize Presentation

**Course:** DH2642 Interaction Programming and the Dynamic Web @ KTH  
**Authors:** Daniel Ruijs & Mattias Kvist  
**Duration:** ~15–20 minutes  
**Live app:** https://forseningskartan.web.app/

---

## Presentation Outline & Script

> Each section below is one **slide (or slide group)**. For each, we provide:
>
> - 🎤 **Script** — what to say out loud  
> - 🖼️ **Slide content** — what to put on the slide  
> - ⏱️ **Timing** — approximate duration

---

### Slide 1 — Title Slide ⏱️ ~30 s

🖼️ **Slide content:**
- Title: **Förseningskartan** (The Delay Map)
- Subtitle: *Exploring public transport delays in Stockholm — live and historical*
- Course: DH2642 Interaction Programming and the Dynamic Web
- Authors: Daniel Ruijs & Mattias Kvist
- URL: https://forseningskartan.web.app/
- A screenshot of the main map view with stops and a departure panel open

🎤 **Script:**
> "Hi everyone! We're Daniel and Mattias, and today we're going to present our project *Förseningskartan* — 'The Delay Map'. It's a web app that lets you explore public transport delays in Stockholm, both live departures and historical delay statistics. It's live right now at forseningskartan.web.app. We're honoured that it won a UX prize, and today we want to share the design choices and implementation decisions that helped us get there."

---

### Slide 2 — The Problem & Motivation ⏱️ ~1 min

🖼️ **Slide content:**
- A relatable image/icon of someone waiting at a bus stop looking frustrated
- Key question: *"Is my bus usually late? How late? Is it worse at certain times?"*
- Bullet points:
  - SL (Stockholm's transit) provides live departure data, but no historical perspective
  - Commuters have no way to know if delays are systematic
  - No tool combines live + historical delay information in one place

🎤 **Script:**
> "We've all been there — waiting at a bus stop, wondering: is this bus always late, or am I just unlucky? Stockholm's transit operator SL provides real-time departure boards, but there's no easy way to see if a route is *systematically* delayed — and there's certainly no tool that combines live departures with historical delay data. That's the gap Förseningskartan fills. We wanted to answer the question: *What is happening right now, and what usually happens?*"

---

### Slide 3 — Live Demo / Walkthrough ⏱️ ~3 min

🖼️ **Slide content:**
- Live demo of the app (or screenshots if no internet), showing:
  1. The interactive map with stop points (styled by theme, highlighted by selection/route)
  2. Clicking a stop → departure panel with live arrivals
  3. Searching for a stop with the search bar (with recent search history)
  4. The route delay statistics page with leaderboard and trend chart
  5. Switching between themes (Light, Dark, and Classic Sepia)
  6. Switching language (English ↔ Swedish)
  7. Signing in with Google → favorite stops in sidebar
  8. Mobile view

🎤 **Script:**
> "Let me walk you through the app. At its core, Förseningskartan is a map-based interface. Every dot on the map is a transit stop point. You can filter which modes to show on the map, and even hide stops that currently have no departures. The stop markers automatically adapt their style to match your active theme, and when you select a route, all stops on that route are highlighted in bright orange so you can trace it visually. The selected stop itself highlights in red.
>
> Clicking a stop opens a live departure panel showing upcoming arrivals with their delays. You can search and filter within the departure list, and you can favorite stops for quick access.
>
> But the real differentiator is the historical view. You can navigate to the route delay page to see how delayed a specific route has been historically — with both a leaderboard of the most delayed routes and a trend chart showing delays by day or by hour.
>
> The app supports three colour themes, two languages, user accounts with Google sign-in, and persisted preferences. It's also mobile-responsive. Let's now talk about how we built all of this."

---

### Slide 4 — System Architecture Overview ⏱️ ~2 min

🖼️ **Slide content:**
- Architecture diagram (draw as a simple flowchart):
  ```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
  │   Frontend   │────▶│  Backend API │────▶│   PostgreSQL DB  │
  │  (React/TS)  │     │    (Go)      │     │  (historical     │
  │ Vite+MUI+TW  │     │              │     │   delay data)    │
  └──────┬───────┘     └──────────────┘     └──────────────────┘
         │                                          ▲
         │                                          │
         ▼                                  ┌───────┴──────────┐
  ┌──────────────┐                          │ GTFS Aggregation │
  │   SL API     │                          │   Pipeline (Go)  │
  │ (live data)  │                          │   Cron job       │
  └──────────────┘                          └──────────────────┘
         │
         ▼
  ┌──────────────┐
  │  Firebase /  │
  │  Firestore   │
  │ (user data,  │
  │  auth)       │
  └──────────────┘
  ```
- Tech stack summary:
  - **Frontend:** React + TypeScript + Vite, MUI components + Tailwind CSS, Leaflet maps, Redux Toolkit
  - **Backend:** Go REST API (exposing Prometheus metrics)
  - **Database:** PostgreSQL 16 (Dockerized)
  - **Data pipeline:** Go aggregator service (with internal cron scheduler)
  - **Auth & user data:** Firebase Auth / Firestore
  - **Hosting:** Firebase Hosting (frontend), self-hosted backend + DB
  - **CI/CD:** GitHub Actions

🎤 **Script:**
> "The system has three main components. First, the **frontend** — a React app built with TypeScript and Vite, using Material UI for components and Leaflet for the interactive map. State management is handled by Redux.
>
> Second, the **backend** — a Go API that serves aggregated historical delay data from a PostgreSQL database. It exposes endpoints for stop delays, route delays, delay trends, and available data dates.
>
> Third, the **GTFS aggregation pipeline** — another Go service running as a cron job. It downloads GTFS Realtime trip update data from SL, parses it, aggregates delay statistics per stop and per route, and writes the results to PostgreSQL. This runs daily so the historical data stays fresh.
>
> User authentication and preferences are handled by Firebase — Google sign-in, and Firestore for persisting things like favorite stops, theme, language, and search history."

---

### Slide 5 — Design Choice #1: MVP Architecture ⏱️ ~2 min

🖼️ **Slide content:**
- Diagram: Model–View–Presenter pattern
  ```
  ┌─────────┐  data   ┌───────────┐  callbacks  ┌──────────┐
  │  Model  │◀───────▶│ Presenter │────────────▶│   View   │
  │ (Redux  │         │ (fetches  │  props      │ (renders │
  │  Store) │         │  data,    │             │  UI only)│
  │         │         │  logic)   │             │          │
  └─────────┘         └───────────┘             └──────────┘
  ```
- Key principles:
  - Views are **pure rendering** — no business logic, no API calls
  - Presenters handle data fetching, state management, and pass props/callbacks to views
  - Model (Redux store) is the single source of truth
- Reference issues: #94 (Single-purpose views), #95 (Separation of concerns), #96 (View logic cleanup), #144 (MVP separation cleanup), #166 (MVP cleanup)

🎤 **Script:**
> "One of our most important architecture decisions was adopting a strict **Model–View–Presenter** pattern — which was also a course requirement, but we took it seriously and iterated on it multiple times.
>
> The Model is the Redux store — the single source of truth. Presenters handle all the data fetching, API calls, and business logic. Views are pure rendering components — they receive props and callbacks from presenters and just display things.
>
> This might sound simple, but early on we had state and controller logic leaking into views. We created issues #94, #95, and #96 specifically to address this. Later, in issues #144 and #166, we did two more cleanup passes to tighten the MVP boundaries even further — removing view composition from presenters, moving all UI state to Redux, and ensuring views had zero side effects.
>
> **Why this matters for UX:** strict separation made the UI predictable. Users experience fewer bugs when state is centralized and views are pure."

---

### Slide 6 — Design Choice #2: The Map-First Interface ⏱️ ~2 min

🖼️ **Slide content:**
- Screenshot of the map view with stop points, search bar overlaying the map, and departure panel
- Design principles highlighted:
  - 🗺️ Spatial context: users think in geography, not route numbers
  - 🔍 Search as an overlay, not a separate page
  - 📍 Geolocation button: "show me what's near me"
  - 🎨 Theme-integrated stop markers (color adjusted for Light, Dark, or Classic mode) with interactive selected/route highlights
  - 🔄 Progressive disclosure: click a stop → departure panel → route delay stats
- Reference issues: #3 (Add map), #10 (Search bar), #87 (Filter by transport mode), #88 (Hide stops without departures)

🎤 **Script:**
> "The map-first design was a deliberate UX choice. When you're wondering about delays, you think spatially — 'what's around me?' — not in terms of route numbers. So the map is the primary navigation tool.
>
> The search bar overlays the map rather than living on a separate page, which keeps the spatial context. Your recent searches are remembered and shown as suggestions. We also added a geolocation button so you can instantly centre the map on your location.
>
> Stop markers are styled to match the active theme. To keep the map clean and prevent noise, we allow users to filter stops by transport mode or hide stops with no active departures. When a route is highlighted, we trace all its stops in orange, and highlight the selected stop in red.
>
> We use progressive disclosure: the map → clicking a stop → the departure panel → and from there a button takes you to detailed route delay statistics. Each step reveals more detail without overwhelming the user upfront."

---

### Slide 7 — Design Choice #3: User Consultations — Iterating on Feedback ⏱️ ~2.5 min

🖼️ **Slide content:**
- Timeline:
  - **Prototyping consultation** (2026-03-21) → Issue #30
  - **Evaluation consultation** (2026-05-11) → Issue #31
- Before/after screenshots for key changes:
  - Departure list grouping by transport mode (feedback point 4 from prototyping)
  - Accent-insensitive search: searching "Fruangen" → shows "Fruängen" (eval feedback 1)
  - Stop circles not shrinking infinitely on zoom (eval feedback 3)
  - Mobile adaptation (eval feedback 6 — "mobile is pretty much unusable")
- Include before/after images from `images/eval-user-consultation/`

🎤 **Script:**
> "We did two formal user consultations — one during prototyping and one during evaluation — and both directly shaped the app.
>
> In the **prototyping consultation**, users said the departure list was too long and hard to scan. They suggested grouping by transport mode and adding filters. We implemented both in issue #43.
>
> They also wanted to see that departures were clickable — so we added visual affordances like arrows and hover states.
>
> In the **evaluation consultation**, we got six pieces of feedback. Let me highlight three:
>
> First, a user with a US keyboard searched for 'Fruangen' without the accent, and got no results. We implemented **accent-insensitive search** so 'Fruangen' now correctly shows 'Fruängen'.
>
> Second, a user noted that stop circles got absurdly small at high zoom levels. We added a minimum size.
>
> Third — and this was the big one — a user said 'mobile is pretty much unusable'. This kicked off issue #154, where we made the departure panel fullscreen on mobile, hid overlapping UI elements, stacked controls vertically, and adjusted the trend charts. The before/after images speak for themselves.
>
> **Key takeaway:** user consultations aren't a checkbox — they're a design tool. Every round of feedback led to measurable UX improvements."

---

### Slide 8 — Design Choice #4: Personalization & Persistence ⏱️ ~1.5 min

🖼️ **Slide content:**
- Features:
  - Google sign-in → user account
  - Favorite stops (star icon in departure view, visible in sidebar)
  - Persisted preferences: theme, language, search history, map filters
  - **Live persistence** across tabs — change a preference in one tab, see it reflected immediately in another
  - First-visit intro guide (only shown once per user, dismissal persisted)
- Stack: Firebase Auth + Firestore for persistence
- Reference issues: #6 (Favorite stops), #59 (Favorites in sidebar), #91 (More personalization), #98 (Search history), #145 (Live persistence)

🎤 **Script:**
> "Personalization was a major UX focus. Users can sign in with Google and get features like favorite stops — star a stop in the departure view and it appears in the sidebar for quick access.
>
> All preferences — theme, language, search history, map filters — are persisted to Firestore. This means your settings follow you across devices.
>
> We went even further with **live persistence**: if you change a preference in one browser tab, the change is instantly reflected in every other open tab via Firestore real-time listeners. This might sound like a small thing, but it makes the app feel modern and polished.
>
> We also added a first-visit intro guide that walks new users through the key features. It only shows once and the dismissal state is persisted, so returning users aren't bothered."

---

### Slide 9 — Design Choice #5: Theming, i18n, and Visual Polish ⏱️ ~1 min

🖼️ **Slide content:**
- Three theme screenshots side by side (Light, Dark, and Classic Sepia)
- Language switcher: English ↔ Swedish
- MUI theming approach: custom theme definitions per colour mode
- Consistent styling across all components via MUI's theme system
- Reference: `frontend/src/theme/` directory

🎤 **Script:**
> "We built three full colour themes — Light, Dark, and a Classic Sepia/Cream mode — using Material UI's theming system. Each theme is defined as a complete MUI theme object, so every component in the app respects the chosen palette consistently.
>
> We also implemented full Swedish and English translations. This is important for a Stockholm-focused app where the user base is bilingual. The language preference is of course persisted.
>
> These might seem like 'nice-to-haves', but in a UX prize context, they signal attention to detail and respect for user preferences."

---

### Slide 10 — The Data Pipeline: Turning Raw GTFS into Insight ⏱️ ~2 min

🖼️ **Slide content:**
- Pipeline diagram:
  ```
  SL GTFS Realtime API
         │
         ▼
  Download trip updates (protobuf)
         │
         ▼
  Parse & aggregate per stop, per route, per hour
         │
         ▼
  Write to PostgreSQL
         │
         ▼
  Backend API serves → Frontend visualises
  ```
- Key challenges:
  - Data volume: processing millions of trip updates
  - Memory management: solved cron job OOM issue (#39)
  - Timezone bugs: wrong cronjob timezone (#54), by-hour data containing previous day's departures (#36)
  - Infrastructure evolution: migrated from Firestore to PostgreSQL + self-hosted Go API (#49–#52)

🎤 **Script:**
> "One of the more technically interesting parts of the project is the data pipeline. SL publishes GTFS Realtime data — a standard format with protobuf-encoded trip updates. Our Go aggregation pipeline downloads this data daily, parses it, and aggregates delay statistics per stop, per route, and per hour.
>
> This wasn't trivial. We hit a memory crash early on — the cron job ran out of memory processing large datasets, which we fixed by optimising data structures. We also had timezone bugs where by-hour data incorrectly included departures from the previous day.
>
> A major architectural shift happened mid-project: we initially stored aggregated data in Firestore, but the query limitations and cost made it impractical. So we migrated to a self-hosted PostgreSQL database with a Go REST API, which gave us far more powerful queries and better scalability. That was a four-issue refactor: issues #49 through #52."

---

### Slide 11 — Development Process & Workflow ⏱️ ~1.5 min

🖼️ **Slide content:**
- GitHub project board (link: https://github.com/users/mattiaskvist/projects/5)
- Stats:
  - ~170 issues tracked over the project lifetime
  - Feature branches + pull requests with code review
  - GitHub Copilot for automated PR review as first pass
  - Manual review for all code
  - CI/CD: GitHub Actions for linting, testing, formatting
  - Docker Compose for local development (PostgreSQL + aggregator + API)
- Timeline:
  - **March 9–16:** Foundation (setup, map, search, departures, historical data)
  - **March 17 – April 9:** Core features (sidebar, auth, route delays, themes, i18n)
  - **April 10 – May 4:** Polish (favorites, personalization, filters, MVP refactors)
  - **May 5–18:** Final push (user consultations, mobile, live persistence, submission)

🎤 **Script:**
> "We tracked all work using GitHub Issues and a project board. Over the project, we created about 170 issues — every feature, bug, refactor, and stretch goal was tracked.
>
> We used feature branches with pull requests and code review. GitHub Copilot helped as a first-pass reviewer, but we always did manual review to make sure we understood and agreed with every change.
>
> CI/CD ran via GitHub Actions — linting, testing, and formatting checks on every push. For local development, Docker Compose spins up the full stack: PostgreSQL, the aggregation pipeline, and the backend API.
>
> The project ran roughly from early March to mid-May, with distinct phases: foundation, core features, polish, and final submission."

---

### Slide 12 — AI Usage: Thoughtful, Not Autopilot ⏱️ ~1 min

🖼️ **Slide content:**
- Example prompts used:
  - *"Rework the route delay leaderboard to use Material UI table"*
  - *"Add a button to navigate from departure view details to the corresponding route delay page"*
  - *"Review the frontend codebase with regards to simplicity, readability, and strict model-view-presenter architecture"*
  - *"The location button does not work after the mobile feature. Nothing happens when I click on it."*
- Approach:
  - ✅ AI for code generation, merge conflict resolution, translation scaffolding
  - ✅ AI for architecture review and finding anti-patterns
  - ✅ Always reviewed and refactored AI output
  - ❌ Never used as a black box — all code was understood before merging

🎤 **Script:**
> "We used AI tools throughout the project — for code generation, merge conflict resolution, adding translations, and even architecture review. But the key principle was: **AI as an accelerator, not an autopilot.** Every piece of generated code was reviewed, understood, and often refactored to match our conventions. One interesting use was asking the AI to review our codebase for MVP architecture violations — it found real issues that we then fixed."

---

### Slide 13 — Key UX Decisions Summary ⏱️ ~1 min

🖼️ **Slide content:**
- Summary table:

| UX Decision | What it does | Why it matters |
|---|---|---|
| Map-first interface | Spatial navigation as primary interaction | Users think in geography, not route numbers |
| Progressive disclosure | Map → stop → departures → route stats | Avoids information overload |
| Accent-insensitive search | "Fruangen" → Fruängen | Respects users' hardware limitations |
| Transport mode filters | Show only buses, metro, etc. | Reduces visual noise on the map |
| Favourite stops | Star stops, see in sidebar | Personalised quick access |
| Live cross-tab persistence | Preferences sync instantly | Feels modern and seamless |
| Three colour themes | Light / Dark / Classic | Respects user preference for visual comfort |
| Mobile adaptation | Fullscreen panels, stacked controls | App usable on any device |
| First-visit intro | Guided onboarding, shown once | Reduces confusion for new users |

🎤 **Script:**
> "Here's a summary of the UX decisions that, together, made the experience feel polished and thoughtful. No single feature won the prize — it's the combination of all these decisions. Each one addresses a specific user need, and many came directly from user feedback."

---

### Slide 14 — Challenges & Lessons Learned ⏱️ ~1.5 min

🖼️ **Slide content:**
- Challenges:
  - 🔄 **Firestore → PostgreSQL migration** — Query limitations forced a mid-project backend rewrite
  - 🐛 **Timezone bugs** — GTFS data uses UTC, SL uses CET/CEST, the cron job had yet another timezone
  - 📱 **Mobile was an afterthought** — User feedback forced a comprehensive mobile adaptation late in the project
  - 🏗️ **MVP discipline** — Keeping views stateless and logic-free required constant vigilance and multiple refactoring rounds
- Lessons:
  - 📋 **Track everything** — Issues for every task made it easy to stay organised and review progress
  - 👥 **User consultations are invaluable** — Real users find problems you'd never think of
  - 🔨 **Refactor early, refactor often** — Architecture debt compounds fast
  - 🎨 **Details matter for UX** — Accent search, minimum circle size, cross-tab sync — the little things add up

🎤 **Script:**
> "The project wasn't smooth sailing. Our biggest mid-project challenge was realising Firestore couldn't handle the queries we needed for historical data, so we had to build a full Go backend and migrate to PostgreSQL. In hindsight, we should have evaluated storage requirements earlier.
>
> Timezone bugs bit us multiple times — the GTFS data is in UTC, SL's schedules use Stockholm time, and our cron job had its own timezone setting. Getting all three to agree took several debugging sessions.
>
> Mobile responsiveness was initially an afterthought. It took a user saying 'mobile is pretty much unusable' to prioritise it. Lesson learned: test on mobile early and often.
>
> And keeping strict MVP architecture discipline required constant effort. It's easy for a quick `useState` or API call to sneak into a view. We did five refactoring passes over the project to keep things clean."

---

### Slide 15 — What We'd Do Differently ⏱️ ~30 s

🖼️ **Slide content:**
- Start with mobile-first design
- Evaluate backend storage needs before choosing a database
- Write more automated tests earlier
- Add end-to-end tests for critical user flows

🎤 **Script:**
> "If we started over, we'd design mobile-first from day one, evaluate our data storage needs more carefully before committing to a stack, and invest more in automated and end-to-end testing early in the project."

---

### Slide 16 — Closing Slide ⏱️ ~30 s

🖼️ **Slide content:**
- Title: **Förseningskartan** (The Delay Map)
- QR code or URL: https://forseningskartan.web.app/
- GitHub: https://github.com/mattiaskvist/forseningskartan
- "Thank you! Questions?"

🎤 **Script:**
> "That's Förseningskartan! The app is live — feel free to try it out. The source code is on GitHub. Thank you for listening, and we're happy to take any questions!"

---

## Appendix: Quick Reference

### Complete Issue Timeline (Key Issues, Chronological)

| # | Title | Closed | Phase |
|---|---|---|---|
| 2 | Setup App with React TypeScript and Tailwind | Mar 12 | Foundation |
| 3 | Add map to mapView | Mar 16 | Foundation |
| 4 | Add suspense view | Mar 16 | Foundation |
| 10 | Stop searchbar | Mar 15 | Foundation |
| 16 | Historical delays (PR) | Mar 13 | Foundation |
| 5 | Make departure view prettier | Mar 22 | Core UX |
| 7 | Average delay per line | Mar 22 | Core UX |
| 30 | Prototyping stage user consultation | Mar 21 | User Consultation |
| 43 | Address prototyping feedback | Mar 22 | User Consultation |
| 8 | Allow users to login with Google | Apr 9 | Auth & Personalization |
| 9 | Extend sidebar with user view | Apr 9 | Auth & Personalization |
| 6 | Favorite stops | Apr 16 | Auth & Personalization |
| 59 | Favorites in sidebar | Apr 16 | Auth & Personalization |
| 49–52 | Backend migration (Firestore → PostgreSQL) | Apr 2 | Architecture |
| 87 | Filter stops by transport mode | Apr 24 | Map UX |
| 88 | Hide stops without departures | Apr 24 | Map UX |
| 91 | More user personalization | Apr 26 | Personalization |
| 94–96 | MVP cleanup (single-purpose views, separation) | Apr 16–17 | Architecture |
| 98 | Store search history | Apr 21 | UX |
| 131 | Custom date range for route delays | Apr 29 | Feature |
| 124 | User geolocation | Apr 29 | Map UX |
| 133 | Swedish translations missing åäö | Apr 26 | Bug |
| 140–143 | Transport mode bugs, naming consistency | May 4–5 | Bug fixes |
| 144 | MVP separation cleanup | May 4 | Architecture |
| 145 | Live persistence update | May 8 | A+ Feature |
| 153 | Address evaluation user consultation feedback | May 12 | User Consultation |
| 154 | Adapt frontend to mobile | May 14 | Mobile |
| 159 | Text overlap on leaderboard | May 13 | Bug |
| 164 | Location button broken on mobile | May 14 | Bug |
| 166 | MVP cleanup (final) | May 15 | Architecture |

### Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI Library | Material UI (MUI) + Tailwind CSS |
| Charts | MUI X Charts |
| Map | Leaflet |
| State Management | Redux Toolkit (with async thunks) |
| Backend | Go (net/http, exposing Prometheus metrics) |
| Database | PostgreSQL 16 (Dockerized) |
| Data Pipeline | Go + GTFS Realtime (protobuf, with internal cron scheduler) |
| Auth | Firebase Auth (Google) |
| User Data | Firestore |
| Frontend Hosting | Firebase Hosting |
| CI/CD | GitHub Actions |
| Dev Environment | Docker Compose |
