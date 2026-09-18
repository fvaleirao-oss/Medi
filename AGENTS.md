# AGENTS.md — Medi

## Overview
Medi is a frontend-only PWA (React 18 + Vite 5 + Material UI 6) for tracking
children's medications and prescriptions as a family. There is **no backend**:
all data persists in `localStorage` (key `medi.state.v1`). The "invite" feature
is a UI mockup (no emails sent); OCR ("llenar desde foto") is not connected.

## Running in Base44
- `docker compose -f docker-compose.base44.yml up -d` starts a `node:22`
  container that runs `npm install && npm run dev -- --host 0.0.0.0`.
- The source is bind-mounted at `/app`, so edits hot-reload via Vite HMR.
- Vite dev server listens on container port 5173, mapped to host port 3000.
- No external credentials or secrets are needed.
- `vite.config.js` already sets `server.host: true`; Vite 5 does not gate by
  origin, so no `allowedDevOrigins`/allowed-hosts config is required.

## Verification
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → `200`.
- The served HTML contains `/@vite/client` and `/@react-refresh` injections,
  confirming live source (not a production build).

## Key source layout
- `src/App.jsx` — top-level router/state, bottom navigation.
- `src/store/AppContext.jsx` — global state + localStorage persistence.
- `src/screens/` — one file per screen (Today, Children, Cabinet, History,
  Settings, Onboarding, ProductForm, ProductDetail, PrescriptionForm,
  ChildDetail).
- `src/components/` — reusable UI (EmptyState, NumberField, PhotoPicker, etc.).
- `src/utils/` — constants and formatting helpers.
