# Deploy Guide (Render + MongoDB Atlas, Free Tier)

This project has two deployables:
- `backend/` (Node + Express API)
- `frontend/` (Vite static site)

It also includes `render.yaml` so you can deploy both services from one Blueprint.

## 0) Security first

Before deploying:
- Do not commit real secrets in `.env` files.
- Use a new `JWT_SECRET` in production.
- Use a dedicated Atlas DB user password for production.

## 1) Push repo to GitHub

From project root:

```powershell
git add .
git commit -m "Add Render blueprint and deploy docs"
git push origin main
```

## 2) Create MongoDB Atlas free cluster

1. Create an Atlas account (if needed).
2. Create a free `M0` cluster.
3. Create a database user (username + password).
4. In Network Access, allow your app traffic (for quickest setup: `0.0.0.0/0`).
5. Get the Node connection string and set DB name to `smart-feedback`.

Example format:

```text
mongodb+srv://<user>:<password>@<cluster-host>/smart-feedback?retryWrites=true&w=majority
```

## 3) Deploy via Render Blueprint (recommended)

1. Open Render dashboard.
2. New -> Blueprint.
3. Connect your repo and branch (`main`).
4. Render detects `render.yaml` and creates:
   - `smart-feedback-backend` (Web Service)
   - `smart-feedback-frontend` (Static Site)
5. Fill required environment variables:
   - Backend:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `ADMIN_EMAIL`
     - `ADMIN_PASSWORD`
     - `CLIENT_URL` (temporary value is fine for now, e.g. `https://example.com`)
   - Frontend:
     - `VITE_API_URL` (temporary value is fine for now, e.g. `https://example.com/api`)
6. Click Deploy.

## 4) Wire frontend <-> backend URLs

After first deploy you will have real URLs.

1. Copy backend URL, e.g. `https://smart-feedback-backend.onrender.com`.
2. Set frontend env var:

```text
VITE_API_URL=https://smart-feedback-backend.onrender.com/api
```

3. Copy frontend URL, e.g. `https://smart-feedback-frontend.onrender.com`.
4. Set backend env var:

```text
CLIENT_URL=https://smart-feedback-frontend.onrender.com
```

5. Redeploy both services (or trigger Manual Deploy in Render).

## 5) Verify deployment

1. Backend health:
   - Open `https://<backend-url>/api/health`
   - Expect JSON: `{"status":"ok"}`
2. Frontend:
   - Open `https://<frontend-url>`
   - Login using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from Render env.
3. Create a form and submit one response.
4. Refresh a deep route directly, e.g. `https://<frontend-url>/admin/login`.
   - It should still work (rewrite is configured in `render.yaml`).

## 6) Troubleshooting

- CORS error in browser:
  - `CLIENT_URL` mismatch (must exactly equal frontend URL, including `https`).
- Frontend cannot call API:
  - `VITE_API_URL` missing `/api` suffix.
- Backend crash on startup:
  - Invalid `MONGODB_URI` or Atlas IP access not allowed.
- Login fails:
  - Wrong `ADMIN_EMAIL`/`ADMIN_PASSWORD` in backend env.
  - If admin was seeded before changing env, use signup or clear/reseed DB.

## 7) Notes on free tier

- Render free web services can spin down on inactivity, so first request may be slow.
- Atlas M0 has storage and throughput limits; enough for demos and small usage.
