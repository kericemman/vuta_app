# Vuta

Vuta is being built as a beauty-services marketplace for Africa.

Current structure:

```text
vuta_app/
├── backend/   # Express + MongoDB API
├── frontend/  # React + Vite waitlist website
└── mobile/    # Expo + React Native app
```

## MVP Direction

The first marketplace version should prove one core flow:

```text
Client finds a nearby provider -> views work/services -> requests a booking.
```

The API now uses these account roles:

- `client`
- `beauty_professional`
- `beauty_business`
- `admin`

Admin is for the website/dashboard side, not the mobile MVP.

## Backend API Foundation

Main modules:

- Auth and user accounts
- Provider profiles
- Services and prices
- Booking requests
- Reviews after completed bookings
- Saved providers
- Waitlist

Important routes:

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/users/me
PATCH  /api/users/me

GET    /api/providers
GET    /api/providers/:id
GET    /api/providers/me/profile
PUT    /api/providers/me/profile
PATCH  /api/providers/:id/verification

GET    /api/services
GET    /api/services/me
POST   /api/services
PATCH  /api/services/:id
DELETE /api/services/:id

GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/:id
PATCH  /api/bookings/:id/status

GET    /api/reviews/provider/:providerId
POST   /api/reviews

GET    /api/favourites
POST   /api/favourites/:providerId
DELETE /api/favourites/:providerId

POST   /api/uploads/portfolio
DELETE /api/uploads/portfolio/:publicId

POST   /api/waitlist
GET    /api/waitlist
```

## Backend Environment

Copy `backend/.env.example` to `backend/.env`, then fill in real values.

Use a current Node LTS version for local and production backend runtime.

For production deployment to `https://vuta.app` and `https://api.vuta.app`, use
[DEPLOYMENT.md](./DEPLOYMENT.md).

The backend has been checked with the real Atlas-style URI present, but this local machine is currently running Node `v25.8.1` and the Atlas connection fails during TLS negotiation. If that happens locally, switch to Node LTS, then restart the backend.

Common list endpoints support pagination:

```text
?page=1&limit=20
```

The API caps `limit` at `100` to protect the database under high traffic.

## Portfolio Images

Provider portfolio uploads use this pipeline:

```text
multipart image -> local compression below 3 MB -> Cloudinary upload -> optimized Cloudinary URL saved on provider profile
```

Upload requirements:

- Field name: `image`
- Allowed types: JPG, PNG, WebP
- Incoming file cap: 12 MB
- Compressed file target: below 3 MB
- Portfolio cap: 8 images per provider

Cloudinary environment variables are listed in `backend/.env.example`.

If the Cloudinary `publicId` contains slashes, pass it after `/api/uploads/portfolio/` exactly as returned.

## Backend Checks

Seed or update the admin user:

```text
cd backend
npm run seed:admin
```

This command reads:

```text
ADMIN_USER_NAME
ADMIN_USER_EMAIL
ADMIN_USER_PHONE
ADMIN_USER_PASSWORD
```

The seed is safe to run more than once. If the admin already exists by email
or phone, the script updates that account, keeps it active, and marks it
verified. The old `npm run create-admin` command is still available as an alias.

Run the API smoke test:

```text
cd backend
npm run smoke
```

The smoke test starts the API on a temporary local port, connects to MongoDB, then checks:

```text
admin login
provider registration/login
provider profile
service creation
provider approval
provider discovery
client registration
booking request
booking acceptance
booking completion
review creation
favourite creation
```

To include a real Cloudinary portfolio upload in the smoke test, set:

```text
SMOKE_TEST_IMAGE_PATH=/absolute/path/to/image.jpg
```

## Mobile App

The mobile app uses Expo, TypeScript, Expo Router, SecureStore, Zustand, React
Query, React Hook Form, and Zod.

First milestone now in place:

```text
register -> login -> secure token storage -> role-based routing
```

Mobile routes:

```text
/(auth)/login
/(auth)/register
/(client)/home
/(client)/explore
/(client)/bookings
/(client)/saved
/(client)/profile
/(provider)/dashboard
/(provider)/bookings
/(provider)/services
/(provider)/portfolio
/(provider)/profile
```

Configure the mobile API URL in `mobile/.env`:

```text
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

When testing on a real phone, replace `localhost` with your computer's LAN IP.
# vuta_app
