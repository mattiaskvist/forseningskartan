# Förseningskartan: UX Prize Presentation Guide

This guide is prepared to help you deliver a compelling 15–20 minute presentation for your project, **Förseningskartan** (Sweden's Delay Map), which has won the UX Prize.

The presentation structure below highlights both the **design choices (UX)** and **implementation decisions** that made this project stand out.

---

## 📅 Presentation Overview (15–20 Minutes)

| Section | Duration | Content | Focus |
| :--- | :---: | :--- | :--- |
| **1. Intro & Problem Statement** | ~2 mins | Background on transit delays & user pain points. | Why this app needs to exist. |
| **2. Architecture Overview** | ~3 mins | System architecture & Model-View-Presenter (MVP). | Maintainability & testability. |
| **3. Chronological Demo & Evolution** | ~12 mins | Live walkthrough of features in order of development. | User-centered feedback & polish. |
| **4. Key Takeaways & AI Collaboration** | ~3 mins | Lessons learned, Firebase sync, and AI co-piloting. | Tech innovation & UX priorities. |

---

## 🎨 Slide Outline

### Slide 1: Welcome & Title
* **Title**: *Förseningskartan: Designing Data-Driven Transit Experiences*
* **Visual**: Screenshot of the classic/retro theme in Stockholm or dark mode map with delay hotspots.
* **Talking Points**: Introduce yourselves and the app. Förseningskartan bridges the gap between *live predictions* (what is happening now) and *historical aggregations* (what usually happens) to help users make smarter transit decisions.

### Slide 2: The Core Problem & Solution
* **Problem**: Live transit apps only show you the current ETA. If a bus is 5 minutes late *now*, is that normal? Should you take the train instead? Passengers lack historical delay visibility at specific hours or routes.
* **Solution**: Scrape GTFS schedule and real-time feeds, aggregate delays, and expose them in an elegant, interactive map interface with Swedish/English localization, personalization, and multi-tab synchronization.

### Slide 3: Architecture: Decoupled & Testable (MVP)
* **Concept**: Discuss your frontend design pattern.
* **Key Architecture**: **Model-View-Presenter (MVP)**.
  * **Model**: Redux Toolkit store + actions + middleware (side effects).
  * **Presenter**: React components that select data from the store, format props, and supply callback actions.
  * **View**: Dumb, passive React/MUI components (e.g., [MapView](frontend/src/views/mapView.tsx)) that only render elements and trigger callback props.
* **Benefit**: Clear separation of concerns, high testability, and Leaflet is kept as a passive renderer (avoiding React-Leaflet binding bottlenecks).

### Slide 4: Data Pipeline (The Engine)
* **Stack**: Go (aggregation pipeline) + PostgreSQL (historical delay storage) + Go API service (backend endpoints).
* **Process**: A cron job downloads Sweden's daily GTFS schedule and aggregates real-time vehicle positions. It aggregates delay rates per stop, per route, and per hour. Exposes clean, lightning-fast REST endpoints for the frontend.

---

## 🖥️ Live Demo Script (Step-by-Step)

Perform this live demo directly in the web browser, starting as an anonymous user (not logged in) to show how the application welcomes new visitors and scales dynamically as they log in.

### Step 1: Initial Welcome (App Intro)
* **Action**: Open the app in a private browsing window (or clear local storage/cookies) to show the **First-Visit Intro**.
* **Highlight (UX)**:
  * **Welcoming UX**: The intro panel sets expectations, guiding new users through four simple tasks: *Find a stop*, *Check live departures*, *Compare historical delays*, and *Explore route delays*.
  * **Persisted Dismissal State**: Once the user clicks "Get started" ("Kom igång"), it stores `hasSeenAppIntro: true` in user preferences so they aren't pestered on future visits.
* **Under the Hood**: Preference loading utilizes Redux actions, ensuring that visual startup side-effects are decoupled from the main react render cycle.

### Step 2: The Stockholm Interactive Map
* **Action**: Pan and zoom around the Leaflet map. Focus on Stockholm Central.
* **Highlight (UX)**:
  * **Smooth Pan/Zoom**: Fast, buttery rendering of transit stops as circles.
  * **Zoom-Scaling Markers**: Stop markers stop shrinking past zoom level 15, ensuring they remain easy to tap or click even when zoomed out.
* **Under the Hood**:
  * Instead of rebuilding Leaflet layers on every React state change (a major performance issue in mapping), the custom `StopMap` component uses internal refs to cache and reuse Leaflet marker instances.

### Step 3: Hot-Swappable Themes (Visual Styling)
* **Action**: Open the sidebar (or map controls) and toggle between **Light**, **Dark**, and **Classic** themes.
* **Highlight (UX)**:
  * **Classic Theme**: A retro wood-beige layout paying homage to Stockholm's vintage transit tickets and signs, enhancing readability and branding.
  * **Zero-Flicker Change**: Swapping themes re-skins the entire UI and swaps Leaflet tile layers instantly without reloading stop points.
* **Under the Hood**: MUI's theme engine customizes all elements (buttons, inputs, toggle buttons) dynamically using HSL/RGBA palettes mapped in `muiTheme.ts`.

### Step 4: Search Bar, History, & Stop Filters
* **Action**: Type a stop name in the search bar. Show search history. Toggle the transport mode filters, then toggle **"Hide unused stops"** ("Dölj oanvända hållplatser").
* **Highlight (UX)**:
  * **Map Stop Filters**: Toggling chips (Bus, Metro, Train, Ferry) filters stops on the map to remove clutter.
  * **Hide Unused Stops**: Hides stops that have no upcoming departures, allowing passengers to focus on active routes.
  * **Recent Search History**: Prioritizes stops the user previously searched for.
* **Under the Hood**: Stop filters are calculated in Redux slices and synced to local storage. Derived data filtering runs in presenters using `useMemo` hooks for maximum UI efficiency.

### Step 5: Selecting a Stop, Departure Search, & Refresh
* **Action**: Search for `Fruangen` (without Swedish letters) or select the stop on the map. In the departures drawer, search for a line in the search input. Click the **Refresh** button.
* **Highlight (UX)**:
  * **Accent-Insensitive Search** (Evaluation Feedback, Issue #153): Typing `Fruangen` automatically finds `Fruängen`. Essential for international travellers and US/UK keyboards.
  * **Manual Refresh Control**: Lets users pull live SL data on demand.
  * **Departure Search**: Search inside the stop's departures list (by designation or destination) to quickly find a train/bus on busy hubs.
* **Under the Hood**:
  * Auto-refresh is managed by Redux Thunks. Stale requests are automatically cancelled if the user rapidly switches stops, preventing racing conditions.

### Step 6: Departure Selection, Delays & Route Highlights
* **Action**: Click on a specific departure. Look at the **Historical Delays** panel. Note the highlighted stops on the map.
* **Highlight (UX)**:
  * **Live vs. Historical Comparison**: Compares the live prediction (e.g. expected departure +2 mins) with the historical performance for that slot.
  * **Route Highlighting on Map** (Prototyping Feedback, Issue #12 / PR #163): When a departure is selected, the map highlights all stop markers served by that route in bright orange, letting the user visually trace the path of the vehicle.
* **Under the Hood**:
  * Selecting a departure triggers a Redux listener that fetches aggregated Go backend historical statistics for that specific line and preset.
  * The presenter calculates the route's stop point GIDs, and the map applies style overrides (`ROUTE_MARKER_STYLE`) to existing cached markers.

### Step 7: Sidebar & Language Switcher
* **Action**: Hover over/open the navigation sidebar. Toggle between **English** and **Swedish** using the flag selectors.
* **Highlight (UX)**:
  * **Language Accessibility**: Fully localized UI. Switching languages alters the entire app's text immediately (including map tooltips, charts, dates, and buttons).
* **Under the Hood**:
  * Translatables are mapped in a lightweight dictionary `translations.ts` and selected via the global state.

### Step 8: User Login, Logout & Account Management
* **Action**: Open a second browser tab next to the first one. In the first tab, click **Log In** in the sidebar. Log in with Google.
* **Highlight (UX)**:
  * **Google Auth Integration**: Smooth, secure pop-up.
  * **Protected Account Actions**: The "Delete Account" action is secured using a custom MUI Dialog confirmation instead of generic browser prompt boxes, matching the premium visual design.
* **Under the Hood**:
  * Firebase Authentication handles token sessions, bound to the Redux `auth` slice.

### Step 9: Personalization & Real-Time Cloud Sync
* **Action**: Click the star icon to favorite the current stop. Show it appearing instantly in the sidebar's favorites.
* **Highlight (UX)**:
  * **Multi-Tab Preference Sync** (Issue #145 / PR #150): Show the second browser tab you opened. It updates *instantly* with the favorite stop and chosen theme/language without any reload!
* **Under the Hood**:
  * Logging in triggers a Redux listener that mounts a Firestore `onSnapshot` listener.
  * When a user changes a preference, it is pushed to Firestore, triggering the snapshot listener in all open sessions/tabs, instantly updating the Redux store.

### Step 10: Analytical Trends (Route Delays Page)
* **Action**: Navigate to the **Route Delays** view in the sidebar. Show the **Delay Leaderboard**. Select a route, then toggle the **Daily / Hourly** trends and adjust the date slider.
* **Highlight (UX)**:
  * **Route Leaderboard**: Ranks routes by delay severity, giving a bird's-eye view of transit health.
  * **Daily vs Hourly Chart Granularity**: Hourly granularity exposes peak delay hours (e.g. morning rush hours) vs daily trends.
  * **Custom Date Ranges**: Lets users select date boundaries (e.g. comparing delays during winter snowstorms).
* **Under the Hood**:
  * Chart visualization uses Recharts. Go API endpoints aggregate delay hours using database timezone calculations.

---

## 💡 Key UX & Implementation Takeaways to Share

Share these three main insights to inspire your classmates:

1. **User Consultations are Essential, Not Checkboxes**:
   * Features like *accent-insensitive stop search*, *zoom-scaled markers*, and *route highlighting on the map* came directly from user testing. They transformed the app from a functional tool into a delightful product.
2. **Architecture Saves UX**:
   * By keeping views "dumb" and presenters "smart" under the MVP pattern, adding complex UI elements (like multi-language flags, style switchers, or maps) never broke existing logic. It also prevented standard React-Leaflet rendering bottlenecks.
3. **AI is a Powerful Partner when Guided by Clean Rules**:
   * Highlight how you used AI (such as Copilot or chatbot reviews) to resolve complex git merge conflicts, verify strict MVP architectural boundaries, and generate Swedish translation files, freeing up your team to focus on design and core Go aggregation logic.
