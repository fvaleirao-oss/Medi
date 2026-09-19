# Medi — Base44 Dev Environment

## Overview
Medi is a React 18 + Vite + Material UI 6 PWA for tracking children's medications.
No backend — all data persists in `localStorage` (key `medi.state.v1`).

## Running the app
```bash
docker compose -f docker-compose.base44.yml up -d
```
- Web entry point: host port 3000 → container port 5173 (Vite dev server).
- Vite runs with `--host 0.0.0.0` and hot reload via chokidar polling.
- Dependencies (`npm install`) run at container startup; `node_modules` is an anonymous volume.

## Health check
`curl http://localhost:3000/` → expect HTTP 200.

## Project structure
- `src/App.jsx` — root component, routing/navigation.
- `src/screens/` — main screens (Today, Children, Cabinet, History, Settings, Onboarding, forms).
- `src/store/AppContext.jsx` — global state + localStorage persistence.
- `src/components/` — shared UI components (EmptyState, NumberField, PhotoPicker, etc.).
- `src/utils/` — constants and formatting helpers.

## Notes
- No secrets or external services required.
- All text is in Spanish.
