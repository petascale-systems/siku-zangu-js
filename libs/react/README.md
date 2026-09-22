# react

UI and data access for the Siku Zangu frontends. It has two entry points:

- `@siku-zangu/react`: for the website (Next.js)
- `@siku-zangu/react-native`: for the mobile app (`src/native.ts`)

What's inside:

- **Data hooks**: `useUser`, `useUsersPage`, `useAdminsPage`, `useCurrentSessionAdmin`, `useArticle`, `useArticlesPage`, `useUserPasswordChange`, and `useAccessToken`. `useUser` has separate web and native implementations.
- **Fetch helpers**: `getJSON`, `postJSON`, `putJSON`, `patchJSON`, `deleteJSON`, and `FETCH_CONFIG`
- **Web components**: website nav and footer, nav link, table, pagination, switch, rich-text editor (Tiptap), dropzone, article card, and admin form

The API host comes from `NEXT_PUBLIC_SIKUZANGU_COM_HOST` or `EXPO_PUBLIC_SIKUZANGU_COM_HOST`. If neither is set, it uses `https://sikuzangu.org`.

```bash
npx nx lint react
npx nx typecheck react
```
