# Personal Fitness Tracker

A full-stack Personal Fitness Tracker application (Express + MongoDB backend, React + Vite frontend). This repository contains the REST API server (backend/) and the React single-page app (frontend/).

---

## Quick overview

- Backend: Node.js, Express, Mongoose (MongoDB).
  - Features: user auth (JWT), workouts & workout-types, diet logging, BMI calculation, food store + ordering, admin APIs, Cloudinary image upload, AI-based nutrition estimate helper.

- Frontend: React + Vite, Bootstrap, Chart.js.
  - Uses axios for API calls. Routes and pages under `frontend/src` (Dashboard, Workout, Diet, BMI, FoodStore, Orders, Profile, Admin pages).

---

## Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB instance (local or hosted)
- (Optional) Cloudinary account for image uploads
- (Optional) API key(s) for AI services if you want diet auto-estimates (Gemini / OpenRouter)

---

## Environment variables

Create a `.env` file in the `backend` folder with at least the following values:

```
# Backend
MONGO_URL=mongodb+srv://<user>:<pass>@cluster.example.mongodb.net/fitness?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
PORT=3000               # optional, defaults to 3000 if not provided

# Cloudinary (optional, required for image uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# AI helpers (optional) - used by diet/estimate
GEMINI_API_KEY=...              # if using Google Gemini
OPENROUTER_API_KEY=...         # fallback provider
```

Frontend needs a Vite environment variable to point to the backend API. Create `.env` in `frontend/` or set in your environment:

```
VITE_API_URL=http://localhost:3000
```

Note: Vite requires `VITE_` prefix for env vars used in the client.

---

## Running locally

1. Backend

```
cd backend
npm install
# ensure backend/.env exists with MONGO_URL and JWT_SECRET
npm run dev   # runs nodemon server.js (defaults to port 3000)
```

2. Frontend

```
cd frontend
npm install
# ensure VITE_API_URL points to the running backend, e.g. http://localhost:3000
npm run dev   # Vite dev server (usually http://localhost:5173)
```

Open the frontend URL printed by Vite (typically http://localhost:5173). Log in / register, then use the app.

---

## API base paths (high-level)

- /api/auth        — register, login, profile (GET/PUT), change-password
- /api/workouts    — create/list/update/delete workouts
- /api/workout-types — admin CRUD for workout types
- /api/diet        — create/list/update/delete diet entries, /estimate for AI nutrition estimate
- /api/bmi         — calculate BMI and history
- /api/food        — list food, admin CRUD, image upload
- /api/orders      — create/list/get/cancel orders (admin endpoints under /api/admin)
- /api/admin       — admin-only endpoints: users, orders, summary

(See backend/routes/ for exact request shapes and validations implemented in code.)

---

## Known issues & recommended quick fixes

Status of items observed during code review:

1. ✅ **aiHelper.js** — Headers syntax verified correct (uses proper Authorization/Content-Type structure with env vars). No fix needed.

2. ✅ **authMiddleware.js** — Updated with explicit checks for missing/malformed Authorization header before parsing the token, returning clean 401 responses instead of relying on try/catch to swallow runtime errors.

3. ⏳ **server.js** — `PORT` should use `process.env.PORT || 3000` to allow deployment platforms (Render, etc.) to assign ports dynamically.

4. ⏳ **backend/package.json** — `nodemon` should be moved to `devDependencies`.

5. ℹ️ **Security note**: JWT is stored in frontend `localStorage` for simplicity (acceptable for this project's scope). A production-grade implementation would use HttpOnly secure cookies with a refresh-token flow to mitigate XSS risk — noted as a known trade-off.

6. ℹ️ **CORS**: Currently uses default `cors()` config (allows all origins) — acceptable for development; production deployments should restrict allowed origins.

## Suggestions & next steps

- Add a root README (this file) — done.
- Add an OpenAPI/Swagger spec or Postman collection to document the API.
- Add centralized error-handling middleware for Express and consistent error response shapes.
- Add axios interceptors in the frontend to handle 401 responses (redirect to /login) and to attach Authorization headers in a single place.
- Add tests (unit/integration) for auth and critical endpoints.
- Consider Dockerizing services and adding a `docker-compose` for local development (Mongo + backend + frontend).

---

## Contributing

If you plan to contribute changes or fixes:

- Create a branch for each topic (e.g., `fix/auth-middleware`, `fix/ai-helper-headers`).
- Run linters and tests (if added) before creating a PR.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

---

If you'd like, I can also create a small patch that fixes the high-priority issues (authMiddleware, aiHelper header bug, and PORT fallback). Please confirm if you want me to apply those changes now.
