# Contributing

Conventions for working in this repo. Keep them consistent — most of the rules
below exist because the codebase drifted away from them at some point.

## File names

**All file names are kebab-case.** No exceptions, including route and page files.

Every source file is one of three kinds, identified by its suffix:

| Kind | Pattern | Example |
| --- | --- | --- |
| Component | `{wui\|nui}-{name}.component.{tsx,ts}` | `nui-primary-button.component.tsx` |
| Type | `{name}.type.ts` | `user.type.ts` |
| Function | `{name}.function.ts` | `insert-one-user.function.ts` |

Component files carry a platform prefix:

- `nui-` — mobile only (`libs/expo`, React Native)
- `wui-` — web only (`libs/react`, `apps/sikuzangu-org`)
- `xui-` — shared, works on both platforms

## Context providers

A provider is exposed as `{NUI|WUI|XUI}{ContextName}.Provider` — a namespace
object, not a `…Provider` function:

```ts
export const XUIQuery = { Provider };   // <XUIQuery.Provider>
export const WUIToast = { Provider };   // <WUIToast.Provider>
```

Hooks stay top-level exports (`useToast`, `useLanguage`), because they are
functions, not part of the component namespace.

**A Server Component cannot reach through that namespace.** Next creates a
client reference per *export* of a `'use client'` module, so
`<XUIQuery.Provider>` inside a server component resolves to `undefined` and the
build fails with "Element type is invalid". Compose providers inside a client
component — `apps/sikuzangu-org/src/app/wui-app-providers.component.tsx` — and
let the server layout render that.

## Identifiers

| Kind | Casing | Example |
| --- | --- | --- |
| Function | camelCase | `getLastLoggedValues` |
| Component | PascalCase, `NUI`/`WUI` prefix | `NUIPrimaryButton` |
| Type | PascalCase | `UserKv` |

## Routes and pages

Route and page files follow their framework's conventions — expo-router for
`apps/app-sikuzangu-org/src/app/**`, Next.js for `apps/sikuzangu-org/src/app/**`.
They keep framework-reserved names (`_layout.tsx`, `index.tsx`, `page.tsx`) and
do **not** take the `.component.tsx` suffix or a platform prefix, because the
filename is the URL segment.

They are still kebab-case, so the route is too, and they carry **no `-screen`
suffix** — the directory already says what they are:

```
apps/app-sikuzangu-org/src/app/tabs/log-entry.tsx   ->  /tabs/log-entry
apps/app-sikuzangu-org/src/app/auth/login.tsx       ->  /auth/login
```

Renaming a route file changes its URL. Update every `pathname:` reference and
the matching `<Stack.Screen name="…" />` entry in the directory's `_layout.tsx`.
Both are easy to miss: four `<Stack.Screen>` names were silently wrong before
this convention landed.

## Barrels

Each directory exports through `index.ts`, and consumers import from the package
alias rather than a deep path:

```ts
// yes
import { NUIPrimaryButton } from '@siku-zangu/expo';

// no
import { NUIPrimaryButton } from '../../libs/expo/src/nui-primary-button.component';
```

Note that `export *` does not re-export a default, so components are exported
as named exports.

## Styling

No hardcoded colours, font sizes, or spacing in screens. Use the tokens:

```ts
import { colors, spacing, radius, typography } from '@siku-zangu/expo';
```

- `colors` — `libs/expo/src/theme.ts`. Every value is checked against WCAG 2.1
  on the surfaces it is used on.
- `typography` — `libs/expo/src/typography.ts`. Each step includes `lineHeight`
  and, deliberately, **no `fontFamily`**: React Native then uses the platform UI
  font (San Francisco on iOS, Roboto on Android), which is what makes text look
  native and respects the reader's Dynamic Type settings. Set `fontWeight` and
  let the system choose the face.

Two rules worth stating outright, because both were violated app-wide before:

- `colors.brand.base` is a **fill**, not a text colour. It is 3.03:1 against
  white, which only clears AA for large text. For brand-coloured text on a light
  surface use `colors.brand.text`, or `colors.brand.onTint` on a pink tint.
- Use `minHeight`, never `height`, on any container holding text — a fixed
  height clips when the reader raises their OS font size.

Avoid `allowFontScaling={false}`. Where growth would break a layout, cap it with
`maxFontSizeMultiplier={MAX_FONT_SCALE}` instead.

## Language

Read the active language from the store, never from a route param:

```ts
import { useLanguage } from '@siku-zangu/expo';

const language = useLanguage();           // 'en' | 'sw'
```

A `lang` route param is frozen per screen, so switching language used to affect
only the screen you landed on — every screen already on the stack kept rendering
the old one. `NUILanguageProvider` holds a single value that all screens share.

Resolution order, highest first:

1. The signed-in user's `kv.language` — the preference belongs to the account,
   so it follows them to a new device.
2. `AsyncStorage`, which covers pre-auth screens and acts as a cache.
3. The device locale via `expo-localization`, when we support it.

`setLanguage()` writes to all of them, so the account record stays correct.

New copy goes in the catalog rather than an inline ternary:

```ts
import { t } from '@siku-zangu/expo';

t('log.addMood');
```

Most existing copy is still inline `language === 'en' ? … : …` — roughly 456
sites. Those keep working; lift them into the catalog as you touch each screen.

## API auth

Two credential systems, not interchangeable:

| | Admin | User (mobile) |
| --- | --- | --- |
| Carrier | `_aus` httpOnly cookie | `Authorization: Bearer` |
| Library | `jose` | `jsonwebtoken` |
| Issued by | `POST /api/sessions` | `POST /api/users/auth` |

Both are HS256 and both are signed with **`S_JWT_SIGNING_KEY`** — one secret,
one rotation.

Guards live in `apps/sikuzangu-org/src/app/api/require-auth.function.ts`. Call
one as the first statement inside `handleAPIError`, and throw rather than
returning a response so the status and body stay in step:

```ts
export async function PATCH(req: NextRequest) {
  return handleAPIError(async () => {
    await requireAdmin();                       // admin-only
    // or: await requireSelfOrAdmin(req, user_id);  // the user themselves, or any admin
  });
}
```

Routes that must stay public: registration (`POST /api/users`), both logins,
and the whole password/PIN reset flow. Everything else that mutates needs a
guard — add one with the route, not afterwards.

### Environment variables

Every variable has a fallback, so the app starts and serves with no
configuration at all. Two of those fallbacks are not safe outside development:

| Variable | Unset behaviour |
| --- | --- |
| `S_JWT_SIGNING_KEY` | Falls back to a constant that is **public in this repo**, so every session cookie and access token is forgeable. Logs a warning once in production. Set it anywhere real accounts exist. |
| `CRON_SECRET` | The notifications cron refuses to run. It previously compared against the literal `"Bearer undefined"`, so anyone sending that header could fire a push to every user. |
| `TWILIO_*` | The two SMS routes return 503. The client is built on first use, so the rest of the app is unaffected. |
| `FIREBASE_*` | Push notifications are skipped; initialisation is already guarded. |
| `REQUIRE_USER_AUTH` | Defaults to off — see below. |

Secrets are mapped to the container in `.drone.yml`.

`REQUIRE_USER_AUTH` gates enforcement on the mobile-facing user routes. It is
off by default: the shipped app stored its token but never sent it, so
requiring it would 401 every install until users updated. Mobile sends the
header as of 1.1.0 — set it to `"true"` in `.drone.yml` once that build has
rolled out. It is a literal there rather than a secret so the change is
reviewable in version control.

Even with the flag off, a token belonging to a *different* user is always
rejected — that closes cross-user access without waiting for the rollout.

## Data fetching

Every API interaction goes through TanStack Query. No `useState` + `useEffect`
fetching, and no hand-rolled caching:

```ts
const { user, upsertUser, isUpsertingUser, error } = useUser(userId);
```

The hooks live in `libs/react` and are **shared by both apps** — Query is
platform-agnostic, so `useUser` is one file rather than the `.native`/`.web`
pair it used to be. The two that are not shared, `useCurrentSessionAdmin` and
`useUserPasswordChange`, navigate with the Next router and so are web only.

Query keys come from `queryKeys` (`libs/react/src/query-keys.function.ts`) so a
mutation can invalidate exactly what it changed. A list key carries its fetch
params, and the bare prefix invalidates every page:

```ts
queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
```

Mutations invalidate rather than splicing results into a cached array. The old
hooks patched `items` locally and left `totalItems`/`totalPages` stale, so the
counts drifted after every create or delete.

## Tests

Specs live in a `__specs__/` folder beside the code they cover, and follow the
same naming as their subject:

```
libs/expo/src/
  nui-primary-button.component.tsx
  __specs__/
    nui-primary-button.component.spec.tsx   # JSX -> .tsx
  utils/
    cycle-calculations.ts
    __specs__/
      cycle-calculations.function.spec.ts   # no JSX -> .ts
```

Run them with `nx test expo` / `nx test react`, or everything with
`nx run-many -t test`.

| | Library | Environment |
| --- | --- | --- |
| `libs/expo` | `@testing-library/react-native` | jest, `babel-preset-expo` |
| `libs/react` | `@testing-library/react` + `user-event` | jest, jsdom |

Test what the component promises, not how it renders. The specs that earn their
place here assert behaviour that regressed before: that a disabled button does
not fire, that an error carries text rather than only a border colour, that a
table tells "loading" apart from "empty" and "failed", and that the colour
tokens still clear their contrast ratios.

Two setup notes, because both cost real time to find:

- Jest config files are `.js`, not `.ts`. The installed jest/ts-node pair cannot
  parse a TypeScript config (`state.conditions.includes is not a function`).
- `libs/react` transforms `debounce`, `flowbite-react` and `@tanstack/*` rather
  than passing them through — they ship ESM only and are required from
  CommonJS.

## Known exceptions

Files that are none of the three kinds — `theme.ts`, `typography.ts`, `*.config.ts`,
and barrel `index.ts` files — are kebab-case with no kind suffix.

`*.model.ts` (19 files in `libs/core`) predates the `.type.ts` convention and is
not yet migrated.
