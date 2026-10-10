# Kindred account frontend

React, TypeScript, React Router, and Tailwind CSS frontend for the account API.

## Run locally

From this directory:

```sh
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and expects the backend at
`http://localhost:8000/api/v1/auth` by default. To use a different API URL, set `VITE_API_URL` to
the auth API base URL (including `/api/v1/auth`). Set the backend's `FRONTEND_URL` to the frontend
origin so CORS and verification/password-reset email links target the correct pages.

## Pages

- `/login` and `/signup` for account access
- `/profile` for the signed-in account
- `/verify/:token` for email verification
- `/forgot-password` and `/reset-password/:token` for password recovery
