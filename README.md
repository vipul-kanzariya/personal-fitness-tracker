# Personal Fitness Tracker

FitTrack is a full-stack personal fitness tracker built with React, Vite, Express, MongoDB, and Razorpay. It includes authentication, workouts, diet tracking, BMI analytics, food inventory, online ordering, refunds, and admin management.

## Features

- User registration, login, profile, password changes, and account blocking
- Workout logging with editable workout types
- Diet entries and optional AI nutrition estimates
- BMI calculation and history
- Food store with image uploads, inventory, stock thresholds, and availability checks
- Razorpay checkout, payment verification, order cancellation, and refunds
- Admin dashboards for users, food, inventory, workout types, and orders
- Responsive layouts for desktop and mobile

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB (local or hosted)
- Cloudinary account for food image uploads
- Razorpay test or live credentials for payments
- Optional Gemini or OpenRouter credentials for AI estimates

## Environment variables

Create `backend/.env`:

```env
MONGO_URL=mongodb+srv://<user>:<password>@cluster.example.mongodb.net/fitness
JWT_SECRET=replace_with_a_long_random_secret
PORT=3000

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

GEMINI_API_KEY=...
OPENROUTER_API_KEY=...

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

Create `frontend/.env` for local development:

```env
VITE_API_URL=http://localhost:3000
```

Never commit `.env` files or expose `RAZORPAY_KEY_SECRET`, database credentials, JWT secrets, or Cloudinary secrets in the frontend.

## Start the application locally

Open two PowerShell terminals from `D:\Personal-fitness-tracker`.

### Terminal 1: backend

```powershell
cd D:\Personal-fitness-tracker\backend
npm install
npm run dev
```

The API runs at `http://localhost:3000`. Make sure MongoDB is running and `backend/.env` is configured before starting it.

### Terminal 2: frontend

```powershell
cd D:\Personal-fitness-tracker\frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

Vite reads environment variables only when it starts. Restart the frontend after changing `frontend/.env`.

## Useful commands

```powershell
# Frontend lint and production build
cd D:\Personal-fitness-tracker\frontend
npm run lint
npm run build

# Backend syntax validation
cd D:\Personal-fitness-tracker\backend
Get-ChildItem -Path routes,models,middleware,scripts -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }

# Remove deprecated macro fields from existing Food documents
npm run migrate:remove-food-macros
```

The migration command should only be run against the intended MongoDB database.

## Main API paths

- `/api/auth` - registration, login, profile, and password operations
- `/api/workouts` - workout CRUD
- `/api/workout-types` - admin workout type CRUD
- `/api/diet` - diet CRUD and estimates
- `/api/bmi` - BMI calculation and history
- `/api/food` - food listing and admin food CRUD
- `/api/inventory` - admin inventory management
- `/api/orders` - checkout, payment verification, orders, and cancellation
- `/api/admin` - admin users, orders, and dashboard summary

## Final verification checklist

Before delivery, test with a fresh browser session:

- Register and log in with two different accounts; verify profiles and histories stay isolated.
- Create, edit, and delete workouts, diet entries, workout types, and food products.
- Calculate BMI with valid heights from 1 to 8 feet and 0 to 11 inches; verify invalid values are rejected.
- Add stock and verify available quantity, threshold status, and out-of-stock behavior.
- Confirm unavailable products cannot be added to cart or purchased.
- Complete a Razorpay test payment and verify stock is deducted exactly once.
- Cancel an unpaid order and verify reserved stock is released.
- Cancel a paid order and verify the refund succeeds before cancellation is recorded.
- Confirm cancelled orders cannot be changed back to another status.
- Confirm cancelled orders are excluded from Admin Dashboard revenue.
- Check currency, calorie, BMI, and total values for sensible rounding without long floating-point strings.
- Test the main pages on desktop and mobile widths.
- Check browser console and network requests for unexpected errors.

## Deployment notes

The frontend and backend are separate services. For Render:

1. Deploy the backend with its MongoDB, JWT, Cloudinary, AI, and Razorpay environment variables.
2. Set the backend `FRONTEND_URL` to the exact deployed frontend origin.
3. Set the frontend `VITE_API_URL` to the deployed backend URL.
4. Commit and push code to the branch connected to Render.
5. Wait for deployment to finish, then test the deployed URL.

Localhost changes do not update Render, and Render data is separate from a local MongoDB database.

## Known production considerations

- JWTs are stored in `localStorage` for this student project. A production-grade application should use secure HttpOnly cookies and refresh tokens.
- Keep CORS restricted with `FRONTEND_URL`.
- Refunds require valid Razorpay credentials and may take time to appear in a customer bank or UPI account.
- No automated test suite is configured yet; use the final verification checklist and build/syntax commands above.
