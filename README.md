# Förseningskartan

The application is currently available at https://forseningskartan.web.app/.

Förseningskartan is a web application for exploring public transport delays, currently only in Stockholm. It combines live departure data from SL with historically aggregated GTFS delay data so users can understand both what is happening now and what usually happens at a stop/route/time. GTFS (General Transit Feed Specification) is a standardized data format used by transit agencies to share schedules and real-time updates, including delays, routes, and stop information.

## What has been done (as of 2026-04-16)

The following has been implemented:

- Basic project setup with Vite + React + TypeScript for frontend and Go for backend and GTFS aggregation
- Core map view, stop search and live departures
- Historical GTFS aggregation pipeline and deployment
- Self-hosted backend API exposing historical delay data
- Integration of aggregated per-stop and route delay data in frontend
- Placeholder integration of per-route delay stats
- Frontend deployment
- Basic sidebar with navigation
- User account view in sidebar and login with Google
- User personalization:
  - Favorite stops in departures view
  - Favorite stops shown in sidebar for logged-in users
  - User preferences (favorite stops, map style) persisted to Firestore

For an up-to-date list of completed work, please visit [the project board and roadmap](https://github.com/users/mattiaskvist/projects/5).

## What is still planned (as of 2026-04-16)

The following work is still planned:

- Historical delay data improvements:
  - Per-route delay stats refinements
  - Show where delays happen on the map (_strech goal_)
- Journey planning and richer trip views (_stretch goal_):
  - Journey planner
  - Live vehicle position and route drawing
  - Integrate historical delay stats into journey planner

For an up-to-date list of planned work, please visit [the project board and roadmap](https://github.com/users/mattiaskvist/projects/5).

## Prototyping Stage User Consultation (2026-03-21)

To satisfy the prototyping-stage user consultation requirement, a documented user consultation was carried out and recorded in [Issue #30](https://github.com/mattiaskvist/forseningskartan/issues/30).

### Feedback received

The consultation produced the following suggestions:

1. Show where delays happen on the map, for example with lines drawn on specific streets where delays happen due to traffic etc.
2. Unclear that departures in departure list can be selected, add an arrow to show that.
3. Would be good to see the route of the bus/train/metro when a departure is selected, see where it goes and to what stops on the map.
4. The departure list can be long, group departures by mode of transport in departure list and allow filtering.

### Addressing feedback

1. Quite difficult to implement, added as a stretch goal [Issue #44: Show where delays happen on the map](https://github.com/mattiaskvist/forseningskartan/issues/44).
2. Addressed in [Issue #43: Addressing feedback from prototyping stage user consultation](https://github.com/mattiaskvist/forseningskartan/issues/43).
3. Was already an idea to implement in [Issue #12: Get live vehicle position and draw route on map](https://github.com/mattiaskvist/forseningskartan/issues/12).
4. Addressed in [Issue #43: Addressing feedback from prototyping stage user consultation](https://github.com/mattiaskvist/forseningskartan/issues/43).

## Evaluation stage user consultation

TODO, https://github.com/mattiaskvist/forseningskartan/issues/31

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
│   │   ├── types/               # Shared TypeScript domain and API response types
│   │   ├── utils/               # Utility helpers (time, site logic, etc.)
│   │   └── views/               # Higher-level view compositions
├── gtfsAggregation/             # Go cronjob that downloads GTFS data, aggregates delays, and writes results to PostgreSQL
```

## SL API concepts

**Site**: A Site is a grouping of StopAreas, e.g. Odenplan which has three stop areas (1131 metro station, 10151 bus station, 5320 railway station).

**Stop Area**: A Stop Area is a grouping of Stop Points with the same traffic type and name, e.g. the Odenplan railway station 5320 which has the name "Stockholm Odenplan". GTFS codes starting with 9021 are stop areas.

**Stop Points**: A Stop Point is a stopping point. A stop area for buses may for example contain one stop point on each side of the road, e.g. the Odenplan bus station stop area 10151 has 12 stop points. GTFS codes starting with 9022 are stop points.
