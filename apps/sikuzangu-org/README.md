# sikuzangu-org

The Next.js app behind sikuzangu.org. It contains:

- **Public site**: home, about, features, user manual, contact, privacy policy, terms of service, and delete-account.
- **Admin dashboard** (`/dashboard`): users, admins, articles, trends, and notifications.
- **REST API** (`src/app/api`), used by the dashboard and the mobile app: sessions, access tokens, users and user auth (OTP and PIN reset), admins, articles, password changes, and notifications.
- **Notification cron** (`src/instrumentation.ts`): sends period, fertile-window, medication, insight, and new-article notifications every day at 08:00 EAT.

## Run

```bash
npx nx serve sikuzangu-org   # dev server on :3000
npx nx build sikuzangu-org   # output in dist/apps/sikuzangu-org
npx nx lint sikuzangu-org
```

## Environment

| Variable | Purpose |
| --- | --- |
| `S_DATABASE_HOST` / `_PORT` / `_USER` / `_PASSWORD` / `_NAME` | Database connection. The password is URL-decoded. |
| `S_JWT_SIGNING_KEY` | Signs admin session JWTs |
| `JWT_SECRET` | Signs mobile user auth tokens |
| `S_BREVO_API_KEY` | Email (see [libs/brevo](../../libs/brevo/README.md)) |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON for push notifications. You can use `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` instead. |
| `TWILIO_ACCOUNT_SID` / `_AUTH_TOKEN` / `_VERIFY_SERVICE_SID` | SMS OTP |
| `CRON_SECRET` | Bearer token for `/api/cron/notifications` |
| `ATLASGO_URL` / `ATLASGO_VAR_DATABASE` | Docker only: the schema is applied on startup |

## Docker

The image builds the app itself, so there is no separate `nx build` step:

```bash
docker build -t sikuzangu-org:<tag> -f ./sikuzangu-org-Dockerfile .
docker run -p 3001:3000 \
  -e S_DATABASE_HOST=<host> -e S_DATABASE_USER=<user> \
  -e S_DATABASE_PASSWORD=<password> -e S_DATABASE_NAME=siku_zangu \
  -e ATLASGO_VAR_DATABASE=siku_zangu \
  -e ATLASGO_URL=mysql://<user>:<password>@<host>:3306/siku_zangu \
  sikuzangu-org:<tag>
```
