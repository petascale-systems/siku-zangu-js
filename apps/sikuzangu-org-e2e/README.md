# sikuzangu-org-e2e

Playwright end-to-end tests for [sikuzangu-org](../sikuzangu-org/README.md). Tests are in `src/`.

```bash
npx playwright test -c apps/sikuzangu-org-e2e/playwright.config.ts
npx nx lint sikuzangu-org-e2e
npx nx typecheck sikuzangu-org-e2e
```

Playwright starts the site itself (`nx run sikuzangu-org:start`) on `http://localhost:3000`. To test a different deployment, set `BASE_URL`.
