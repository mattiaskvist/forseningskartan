# Frontend

## Setup

Create a `.env` file in the root `frontend/` directory following the `.env.template` file:

- Configure `VITE_BACKEND_API_URL` to point at the backend API (default local value is `http://localhost:8081`).
- Configure `VITE_BACKEND_API_KEY` with the API key for authenticating to the backend. Used only for local development, the deployed frontend uses a different authentication mode that allows requests only from specific origins.

The frontend fetches historical delay data and SL stop points through the backend API (`/api/*`). Routing stop-point requests through the backend avoids browser CORS issues against the SL transport API.

## Running the frontend

```bash
npm install
npm run dev
```
