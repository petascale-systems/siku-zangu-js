# core

`@siku-zangu/core`: plain TypeScript shared by the website, the API, and the mobile app. It has no React and no Node-only code.

- **Models (Zod)**: user, admin, article, access token, email and password, password change, and KV
- **Paging**: `FetchParams` and the per-entity fetch params, plus `Page`
- **Errors**: `ApiError`, `handleAPIError`, and conversions between Zod errors and API errors
- **Utils**: phone number helpers

```bash
npx nx lint core
npx nx typecheck core
```
