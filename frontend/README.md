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

## Color modes

The app ships three color modes — **Dark**, **Light**, and **Classic** — implemented entirely through [MUI's theming system](https://mui.com/material-ui/customization/theming/) with no custom CSS variables or token layers.

### Architecture

```
src/theme/muiTheme.ts          <- single source of truth
src/store/userPreferencesSlice  <- stores selected AppStyle in Redux + localStorage
src/App.tsx                     <- wraps the app in <ThemeProvider>
```

`muiTheme.ts` defines one MUI `createTheme()` per color mode. Each theme only sets standard MUI palette properties:

| MUI palette property   | What it controls                               |
| ---------------------- | ---------------------------------------------- |
| `background.default`   | Page / app background                          |
| `background.paper`     | Panel, card, and drawer surfaces               |
| `text.primary`         | Main body text                                 |
| `text.secondary`       | Muted / secondary text                         |
| `primary.main`         | Accent color (links, active nav, selected item) |
| `divider`              | Borders and separators                         |
| `action.hover`         | Hover backgrounds, subtle surface fills        |
| `action.selected`      | Active / selected item backgrounds             |

No module augmentation or custom palette keys — every color in the app maps to a built-in MUI token.

### How components consume the theme

Components reference colors using MUI's `sx` prop string shortcuts, so they never need `useTheme()`:

```tsx
<Paper variant="outlined" sx={{ bgcolor: "background.paper" }}>
    <Typography sx={{ color: "text.primary" }}>Title</Typography>
    <Box sx={{ borderColor: "divider", bgcolor: "action.hover" }}>…</Box>
</Paper>
```

MUI resolves these strings against the current theme automatically.

### Component overrides

We have three overrides in `muiTheme.ts`, each for a specific reason:

- **`MuiButton`** / **`MuiToggleButton`** — `textTransform: "none"`. MUI defaults to UPPERCASE button labels, which almost every project overrides.
- **`MuiOutlinedInput`** — Uses `palette.divider` for borders (MUI defaults to a hardcoded alpha value that doesn't match the rest of the UI), and adds a subtle background fill via `action.hover` (MUI defaults to transparent).

Everything else (Paper, Card, Pagination, IconButton, InputLabel, etc.) relies on MUI's built-in palette resolution so no overrides needed.

### Persistence

The selected color mode is:

1. **Cached in `localStorage`** — read synchronously at startup as the Redux initial state to avoid a flash of the wrong theme.
2. **Persisted to Firebase** — synced when the user is logged in so their preference follows across devices.
