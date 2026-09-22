# knex

`@siku-zangu/knex`: server-side data access with [Knex](https://knexjs.org) on MySQL or MariaDB. Only the Next.js API and cron import it.

- `DATABASE` (a Knex instance) and `DATABASE_CONFIG`: the connection, configured from environment variables
- Queries grouped by table: `users`, `admins`, `articles` (including cover images), and `user-password-changes`
- `notifications`: push notification scheduling (period, fertile window, medication, insights, and new articles) via Firebase Admin
- `createBcryptHash`: password hashing

The schema itself is in [atlasgo](../../atlasgo/README.md).

## Environment

| Variable | Default |
| --- | --- |
| `S_DATABASE_HOST` | `localhost` |
| `S_DATABASE_PORT` | `3306` |
| `S_DATABASE_USER` | `user` |
| `S_DATABASE_PASSWORD` | `password` (URL-decoded) |
| `S_DATABASE_NAME` | `siku_zangu` |
| `FIREBASE_SERVICE_ACCOUNT` | JSON. You can use `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` instead. |

```bash
npx nx lint knex
npx nx typecheck knex
```
