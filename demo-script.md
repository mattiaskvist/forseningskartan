# Förseningskartan: Live Demo Script (Quick Reference)

### 1. App intro
* **Show**: Logged out, clear localStorage. Open app. Show welcome message. Dismiss it. Refresh page. No welcome message.
* **Explain**: Dismissed once, saved in localStorage/firestore.

### 2. Map
* **Show**: Stockholm Central. Pan & zoom. Geolocation click.
* **Highlight**: Circle markers are stops.
* **Explain**: Map optimizations with 6k+ stops.

### 3. Stop Selection & Live Departures
* **Show**: Click a stop. Filter departures. Click Refresh.
* **Highlight**: Planned vs expected times, delay highlighting. In-list search.

### 4. Trip Details & Route Highlighting
* **Show**: Click departure. Open delay stats.
* **Highlight**: Historical avg delay & % on-time (current hour). Orange stops highlighted on map.

### 5. Stop Search & Map Filters
* **Show**: Click search bar. Toggle mode chips (Bus, Metro, Ferry).
* **Highlight**: Accent insensitive search. Hide unused stops. Refer to user evaluation.
* **Explain**: How "hide unused stops works". Mixing data sources (timetable + stops).

### 6. Sidebar & Languages & Themes
* **Show**: Open sidebar. Toggle Swedish/English flags. Toggle themes.
* **Highlight**: Instant translation. Theme consistent across whole app.
* **Explain**: Themes managed by Material UI. Translations inspred by i18n standard.

### 7. Route Delays Page
* **Show**: Search routes, paged results. Select route, show trend (daily/hourly).
* **Highlight**: Daily vs Hourly toggle. Paged results for performance.

### 8. Route Delay Leaderboard
* **Show**: Show leaderboard.
* **Highlight**: Top delayed routes based on historical data.

### 9. Authentication
* **Show**: Sidebar -> Google sign-in.
* **Highlight**: Personalized features (favorites, user preferences across devices). Login enhances experience but is optional.

### 10. Favorites & Starred Stops
* **Show**: Favorite -> unfavorite a stop. Show snackbar.
* **Highlight**: MUI snackbar to "keep users informed about what is going on" (Nielsen's heuristic). Important for UX.

### 11. Cloud Sync & Live Tab Persistence (A+ Feature)
* **Show**: Open app on mobile -> toggle theme, favorite stop, language.
* **Highlight**: Desktop updates instantly.
* **Explain**: Firestore `onSnapshot` + Redux middleware.

### 12. Account page
* **Show**: Can remove account. Show confirmation dialog.
* **Highlight**: Confirmation dialog to prevent accidental deletion. Account removal important for user trust and data security.

