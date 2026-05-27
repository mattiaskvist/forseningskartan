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

## 🖥️ Live Demo Script (Chronological Order)

Perform this live demo directly in the web browser, walking the class through the features in the order they were built, pointing out the UX reasoning and code decisions.

### Step 1: The App Intro & Map Foundation
* **Action**: Open the app in a fresh private window (or clear local storage) to trigger the **First-Visit Intro**.
* **Highlight (UX)**: 
  * The [App Intro Dialog](frontend/src/utils/translations.ts#L47-L73) sets expectations. It guides the user through four simple steps (Hitta hållplats, Se avgångar, Jämför historik, Utforska trender).
  * Persisted dismissal: Once dismissed, it writes `hasSeenAppIntro: true` to Redux and Firestore/localStorage, so returning users aren't pestered.
* **Under the Hood**: Passive Leaflet integration. Explain that you write to Leaflet refs directly rather than recreating layers on every render, keeping map panning and zooming buttery smooth.

### Step 2: Stop Search & Geolocation
* **Action**: Click the **Geolocation button** in the bottom left. Then search for a stop (e.g., type "Fruangen" with no Swedish characters).
* **Highlight (UX)**:
  * **Accent-insensitive search** (Evaluation Feedback, Issue #153): Typing `Fruangen` matches `Fruängen`. Essential for international students or users with US/UK keyboards.
  * **Camera FlyTo**: Smooth animated camera pan when centering on the user or selecting a stop.
  * **Zoom Sizing Policy**: Stop markers (circles) stop shrinking below zoom level 15 so they remain clickable on any screen size.
* **Under the Hood**:
  * Redux Toolkit `listenerMiddleware` listens for the `requestUserGeolocation` action and triggers the browser API, showing a helpful snackbar ("Finding your location...").
  * Autocomplete search options are cached in Redux for instantaneous rendering.

### Step 3: Departure List & Live vs. Historical Delays
* **Action**: Select the stop (e.g., `Fruängen`). The sidebar panels slide open. Point out the live departures. Click the **Refresh button** in the departure header. Select a specific departure to open its details.
* **Highlight (UX)**:
  * **Refresh Button**: Keeps users in control. Live predicted time vs planned time is visible.
  * **Historical Delays Panel**: Shows how this specific departure line performs on this day/hour historically (e.g., "delayed on average by 3 minutes, 70% on time").
  * **Grouping & Filtering**: Departures are grouped by transport mode (Metro, Bus) with toggle chips at the top to prevent cognitive overload.
* **Under the Hood**:
  * The departures are fetched from the SL API via the Go backend.
  * Once a departure is selected, `listenerMiddleware` detects the change and automatically fires a thunk to retrieve historical delay summaries for that specific trip slot.

### Step 4: Multi-Theme & Localization Switchers
* **Action**: Go to the Sidebar. Toggle between English and Swedish. Switch themes between **Light**, **Dark**, and **Classic**.
* **Highlight (UX)**:
  * **Classic Theme**: A retro beige-brown layout that aligns with vintage Stockholm transit aesthetics (improving visual character).
  * **Language Switcher**: Full Swedish flag icon details. Real-time language updates across all components.
  * **Mobile Auto-Hide**: The theme switcher on the map hides on small mobile screens to keep the viewport clean.
* **Under the Hood**:
  * Custom MUI themes are created dynamically inside [muiTheme.ts](frontend/src/theme/muiTheme.ts).
  * The translation mappings are structured cleanly in [translations.ts](frontend/src/utils/translations.ts).

### Step 5: User Accounts & Real-Time Sync (The A+ Feature)
* **Action**: Open two separate browser tabs side-by-side. Log in with Google. Favorite a stop on one tab, or change the app theme. Watch the other tab update *instantly* without a page reload.
* **Highlight (UX)**:
  * A logged-in user gets their preferences synced.
  * **Live Tab Persistence**: Changes propagate instantly. If a user favorites a stop in one tab, the sidebar in the other tab updates.
* **Under the Hood**:
  * Inside [store.ts](frontend/src/store/store.ts#L265-L353), when a user logs in, the `setUser` listener sets up a Firestore `onSnapshot` listener. 
  * The listener subscribes to preference updates in the cloud and dispatches `applyLoadedUserPreferences` to synchronize the Redux store instantly across active sessions.

### Step 6: Analytical Trends & Custom Dates
* **Action**: Navigate to the **Route Delays** view in the sidebar. Show the **Delay Leaderboard** (which routes are most delayed). Select a route to view its detail page. Toggle between **Daily** and **Hourly** trends. Drag the date slider to select a custom date range.
* **Highlight (UX)**:
  * **Granularity Toggle**: Lets users see delays by day of the week or by hour of the day (e.g., morning rush hour spike).
  * **Custom Date Ranges**: Gives power users the ability to investigate delays during snowstorms or holidays.
* **Under the Hood**:
  * Chart data is rendered via Recharts.
  * Hourly aggregation queries are served by Go backend SQL grouping statements.

### Step 7: Route Highlighting on Map (Closing the Loop)
* **Action**: Go back to the Map View. Select a departure from the list. Notice the highlighted stops on the map.
* **Highlight (UX)**:
  * Readdresses the prototyping user feedback (Issue #12 / #163): "Highlight where the route goes." The map highlights all stops on the selected departure route in bright orange.
* **Under the Hood**:
  * The presenter computes the list of site IDs served by the selected route.
  * The map component applies the orange `ROUTE_MARKER_STYLE` to existing markers rather than creating new layers, avoiding rendering lag.

### Step 8: Mobile-Friendly Layout
* **Action**: Toggle Chrome Developer Tools to Mobile view (or explain how mobile layouts work).
* **Highlight (UX)**:
  * The departure panel slides up into full screen.
  * Sidebar navigations and map overlays hide when panels are active to prevent overlapping text and clutter.
  * Route filters stack vertically, and trend charts adjust width dynamically.

---

## 💡 Key UX & Implementation Takeaways to Share

Share these three main insights to inspire your classmates:

1. **User Consultations are Essential, Not Checkboxes**:
   * Features like *accent-insensitive stop search*, *zoom-scaled markers*, and *route highlighting on the map* came directly from user testing. They transformed the app from a functional tool into a delightful product.
2. **Architecture Saves UX**:
   * By keeping views "dumb" and presenters "smart" under the MVP pattern, adding complex UI elements (like multi-language flags, style switchers, or maps) never broke existing logic. It also prevented standard React-Leaflet rendering bottlenecks.
3. **AI is a Powerful Partner when Guided by Clean Rules**:
   * Highlight how you used AI (such as Copilot or chatbot reviews) to resolve complex git merge conflicts, verify strict MVP architectural boundaries, and generate Swedish translation files, freeing up your team to focus on design and core Go aggregation logic.
