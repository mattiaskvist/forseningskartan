# Förseningskartan

The application is currently available at https://forseningskartan.web.app/.

Förseningskartan is a web application for exploring public transport delays, currently only in Stockholm. It combines live departure data from SL with historically aggregated GTFS delay data so users can understand both what is happening now and what usually happens at a stop/route/time. GTFS (General Transit Feed Specification) is a standardized data format used by transit agencies to share schedules and real-time updates, including delays, routes, and stop information.

## Running the project:

The project consists of a frontend, a backend API, and a GTFS aggregation pipeline. For instructions on how to run each component locally, please see the respective README files in the [frontend](frontend/README.md), [backend](backend/README.md), and [GTFS aggregation](gtfsAggregation/README.md) directories.

## What has been done (as of 2026-05-11)

The following has been implemented:

- Basic project setup with Vite + React + TypeScript for frontend and Go for backend and GTFS aggregation
- Core map view, stop search with search history and live departures with refresh button
- Filtering of stops on map by method of transportation and option to hide stops without departures
- User geolocation and centering map on user location with a button
- Historical GTFS aggregation pipeline and deployment
- Self-hosted backend API exposing historical delay data
- Integration of aggregated per-stop and route delay data in frontend
- Per-route delay stats page with various filters and a delay trend chart that shows delays by day and by hour
- Per-route delay leaderboard showing which routes are most delayed on average
- Frontend deployment
- Basic sidebar with navigation
- Three color themes used across the app and a style switcher in sidebar and on the map
- Support for two languages (Swedish and English) with a language switcher in the sidebar
- User account view in sidebar and login with Google
- User personalization:
  - Favorite stops in departures view
  - Favorite stops shown in sidebar for logged-in users
  - User preferences (favorite stops, app style, search history, language, map stop filters) persisted to Firestore
- Live persistence update: when a user changes a preference in one tab the change is immediately reflected in all other tabs
- App intro on first visit with persisted dismissal state so it only shows once
- Adaptations to make the app more mobile-friendly

For an up-to-date list of completed work, please visit [the project board and roadmap](https://github.com/users/mattiaskvist/projects/5).

## What is still planned (as of 2026-05-11)

The following work is still planned:

- Historical delay data improvements:
  - Show where delays happen on the map (_strech goal_)
- Journey planning and richer trip views (_stretch goal_):
  - Journey planner
  - Live vehicle position and route drawing
  - Integrate historical delay stats into journey planner

For an up-to-date list of planned work, please visit [the project board and roadmap](https://github.com/users/mattiaskvist/projects/5).

## User consultations

User consultations have been carried out in both the prototyping stage and the evaluation stage, and feedback has been collected and addressed. For details, see [the user consultations documentation](user-consultations.pdf).

To convert the file to PDF, you can use a tool like Pandoc. For example, you can run the following command in your terminal:

```bash
pandoc user-consultations.md -o user-consultations.pdf
```

## AI usage

AI tools were used in various stages of the project, including code generation and code review. For details on how AI was used, see [the AI usage documentation](ai-usage.pdf). The text is written in Markdown and can be converted to PDF using a tool like Pandoc with the following command:

```bash
pandoc ai-usage.md -o ai-usage.pdf
```

## Project file structure

Directory overview:

```text
.
├── .github/                     # CI/CD workflows for frontend, backend, deployment, and aggregation jobs
├── backend/                     # Go API service exposing historical delay endpoints from aggregated data stored in a PostgreSQL database
├── frontend/                    # Vite + React + TypeScript frontend
│   ├── src/                     # Main frontend application source code
│   │   ├── api/                 # API clients (backend and SL transport)
│   │   ├── components/          # Reusable UI components (lists, controls, maps, stats, suspense)
│   │   ├── firebase/            # Firebase/Firestore configuration and data access helpers
│   │   ├── presenters/          # Presenters that handle data fetching for views
│   │   ├── store/               # Redux store setup with actions, reducers, and selectors
│   │   ├── test/                # Test setup and shared config
|   |   ├── theme/               # MUI theme definitions for the app's color modes
│   │   ├── types/               # Shared TypeScript domain and API response types
│   │   ├── utils/               # Utility helpers (time, site logic, etc.)
│   │   └── views/               # Higher-level view compositions
├── gtfsAggregation/             # Go cronjob that downloads GTFS data, aggregates delays, and writes results to PostgreSQL
```

## Third-party components in frontend

The project mainly uses [MUI](https://mui.com/) components for UI, and [Leaflet](https://leafletjs.com/) for the map. Examples:
- **Map**: `StopMap` - Leaflet-based interactive map used across the app; see [frontend/src/components/StopMap.tsx](frontend/src/components/StopMap.tsx#L125).
- **Route delay leaderboard**: `RouteDelayLeaderboardView` - table view that shows the most delayed routes; see [frontend/src/views/routeDelayLeaderboardView.tsx](frontend/src/views/routeDelayLeaderboardView.tsx#L24).
- **Route delay trend chart**: `RouteDelayTrendChart` - line chart for visualizing route delay trends over time; see [frontend/src/components/RouteDelayTrendChart.tsx](frontend/src/components/RouteDelayTrendChart.tsx#L20).
- **Search bar**: `SearchBar` - autocomplete search for stops with recent-history prioritization; see [frontend/src/components/SearchBar.tsx](frontend/src/components/SearchBar.tsx#L28).

## SL API concepts

**Site**: A Site is a grouping of StopAreas, e.g. Odenplan which has three stop areas (1131 metro station, 10151 bus station, 5320 railway station).

**Stop Area**: A Stop Area is a grouping of Stop Points with the same traffic type and name, e.g. the Odenplan railway station 5320 which has the name "Stockholm Odenplan". GTFS codes starting with 9021 are stop areas.

**Stop Points**: A Stop Point is a stopping point. A stop area for buses may for example contain one stop point on each side of the road, e.g. the Odenplan bus station stop area 10151 has 12 stop points. GTFS codes starting with 9022 are stop points.
