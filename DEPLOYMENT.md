# Vuta Deployment Guide

Production domains:

- Website/admin: `https://vuta.app`
- Backend API/realtime: `https://api.vuta.app`

This repo should stay as one monorepo:

```text
vuta_app/
  backend/   Express API, MongoDB, Socket.IO
  frontend/  Vite website and admin dashboard
  mobile/    Expo mobile app
```

Do not split the folders into separate GitHub repositories unless there is a strong reason later. Deployment platforms can use a subfolder as the project root.

## 1. Clean Git Before Pushing

The source code should go to GitHub. Secrets and installed dependencies should not.

Already prepared:

- Root `.gitignore` exists.
- `backend/.env`, `frontend/.env`, and `backend/node_modules` have been removed from the Git index but remain on the local machine.

Before pushing, confirm:

```bash
git status --short
git ls-files '*.env' '*/.env'
git ls-files '*node_modules*' | head
```

Expected:

- Real `.env` files should not appear in `git ls-files`.
- `node_modules` should not appear in `git ls-files`.
- `mobile/` source files should be added to Git.

## 2. Backend Deployment

Deploy the backend first because both website and mobile depend on it.

Use these settings on Hostinger Node app, Render, Railway, Fly.io, DigitalOcean App Platform, or another Node-capable host:

```text
Root directory: backend
Node version: 24.x
Install/build command: npm ci
Start command: npm start
Health check path: /health
Production domain: https://api.vuta.app
```

Set backend environment variables from:

```text
backend/.env.production.example
```

Critical production values:

```text
NODE_ENV=production
CLIENT_URL=https://vuta.app,https://www.vuta.app
FRONTEND_URL=https://vuta.app
APP_PASSWORD_RESET_URL=vuta://reset-password
```

Generate strong secrets:

```bash
openssl rand -base64 64
```

Use different values for:

```text
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
WAITLIST_ADMIN_KEY
ADMIN_USER_PASSWORD
```

After the backend deploys, test:

```bash
curl https://api.vuta.app/
curl https://api.vuta.app/health
curl https://api.vuta.app/api/app-config
```

Expected:

- `/` returns `Vuta API is running`
- `/health` returns `status: ok` after MongoDB connects
- `/api/app-config` returns security/app configuration

Seed admin on the production backend host after env vars are set:

```bash
cd backend
npm run seed:admin
```

## 3. DNS For Backend

In the DNS provider for `vuta.app`, create `api.vuta.app`.

Use the record required by your backend host:

```text
api CNAME <backend-provider-target>
```

or:

```text
api A <backend-server-ip>
```

Enable SSL/TLS on the backend host. Do not use the mobile app against plain HTTP in production.

## 4. Frontend Deployment

The frontend is the public website plus admin dashboard.

Use:

```text
Root directory: frontend
Install/build command: npm ci && npm run build
Output directory: dist
Production domain: https://vuta.app
```

Set frontend environment variables from:

```text
frontend/.env.production.example
```

Production value:

```text
VITE_API_URL=https://api.vuta.app/api
```

SPA fallback is prepared for:

- Vercel: `frontend/vercel.json`
- Apache/Hostinger static hosting: `frontend/public/.htaccess`

After deploy, test:

```text
https://vuta.app
https://vuta.app/admin
```

The admin login should call:

```text
https://api.vuta.app/api/auth/login
```

## 5. DNS For Website

Point `vuta.app` and optionally `www.vuta.app` to the frontend host.

Typical records:

```text
@     A      <frontend-host-ip>
www   CNAME  vuta.app
```

or for platforms like Vercel/Netlify:

```text
@     A/CNAME  <platform target>
www   CNAME    <platform target>
```

Enable SSL/TLS for both:

```text
https://vuta.app
https://www.vuta.app
```

## 6. Mobile Deployment

Mobile is not hosted on the website. It should still be committed to GitHub as source code, then built with Expo/EAS.

Prepared files:

```text
mobile/eas.json
mobile/.env.production.example
```

Production mobile env:

```text
EXPO_PUBLIC_API_URL=https://api.vuta.app/api
EXPO_PUBLIC_REALTIME_URL=https://api.vuta.app
```

Production app IDs in `mobile/app.json`:

```text
iOS bundleIdentifier: app.vuta.mobile
Android package: app.vuta.mobile
```

Install EAS CLI if needed:

```bash
npm install --global eas-cli
```

Login and configure:

```bash
cd mobile
eas login
eas build:configure
```

Internal test builds:

```bash
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

Production builds:

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

Submit to stores:

```bash
eas submit --platform ios
eas submit --platform android
```

## 7. Final Verification

Run local checks before every production push:

```bash
cd backend
node --check server.js
find . -path './node_modules' -prune -o -name '*.js' -print0 | xargs -0 -n 1 node --check

cd ../frontend
npm run lint
npm run build

cd ../mobile
npx tsc --noEmit
```

Run backend smoke only against staging or a disposable test database:

```bash
cd backend
npm run smoke
```

The smoke test writes users, services, bookings, messages, updates, feedback, reviews, and favourites.

## 8. Recommended Deploy Order

1. Push cleaned monorepo to GitHub.
2. Deploy backend from `backend/`.
3. Attach `api.vuta.app` and verify `/health`.
4. Seed admin.
5. Deploy frontend from `frontend/`.
6. Attach `vuta.app` and verify `/admin`.
7. Build mobile preview with EAS.
8. Test real registration, login, browsing, booking, image upload, notifications, and messages.
9. Submit mobile production builds.
