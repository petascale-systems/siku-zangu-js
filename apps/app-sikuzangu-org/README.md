# app-sikuzangu-org

The Siku Zangu mobile app for iOS and Android: track your cycle and understand your body, in Kiswahili and English. Built with Expo (SDK 54) and expo-router.

- **App Store:** [Siku Zangu](https://apps.apple.com/us/app/siku-zangu/id6755812712)
- **Play Store:** [org.sikuzangu.app](https://play.google.com/store/apps/details?id=org.sikuzangu.app)

Screens live in `src/app`:

- `auth/`: register, login, OTP verification, forgot PIN, and reset PIN
- `onboarding/`: names, date of birth, period and cycle length, symptoms, and medication
- `tabs/`: home, calendar, log entry, insights, and profile (personal info, language, notification settings, change PIN, and delete account)
- `article-detail.tsx`: a single health article; `language.tsx`: the first-launch language picker

Shared UI and cycle logic come from [libs/expo](../../libs/expo/README.md). API hooks come from `@siku-zangu/react-native` ([libs/react](../../libs/react/README.md)).

## Run

Run `npm install` at the repo root first. You need Xcode for iOS and Android Studio for Android.

```bash
npx nx run-ios app-sikuzangu-org       # build a dev client and run it on the iOS simulator
npx nx run-android app-sikuzangu-org   # build a dev client and run it on an Android emulator or device
npx nx start app-sikuzangu-org         # Metro only, for a dev client that is already installed
```

The app uses native Firebase modules, so it doesn't run in Expo Go. Use a dev client, either one built locally as above or the EAS `development` build.

By default the app calls `https://sikuzangu.org`. To use a local API, set `EXPO_PUBLIC_SIKUZANGU_COM_HOST=http://<your-ip>:3000`.

`ios/` and `android/` are generated and not committed. To regenerate them, run `npx nx prebuild app-sikuzangu-org`.

## Test

```bash
npx nx typecheck app-sikuzangu-org
npx nx lint app-sikuzangu-org
```

There are no unit tests yet. `jest.config.ts` exists, but no `test` target is wired up.

## Build (EAS)

Builds run on [EAS](https://expo.dev), using the profiles in `eas.json`. You need an Expo account with access to the project; its ID is in `app.json`.

```bash
npx nx build app-sikuzangu-org --profile=development   # dev client, internal distribution
npx nx build app-sikuzangu-org --profile=preview       # Android APK + iOS simulator build, for testers
npx nx build app-sikuzangu-org --profile=production    # store builds (Android .aab, iOS .ipa)
```

Add `--platform=ios` or `--platform=android` to build for one platform only.

## Release

1. In `app.json`, bump `version` (the user-facing version) and `android.versionCode` (must increase with every Play Store upload).
2. Build: `npx nx build app-sikuzangu-org --profile=production`
3. Submit: `npx nx submit app-sikuzangu-org`. This runs `eas submit` and asks which build to upload.

**App Store (iOS)**
- Bundle ID `org.sikuzangu.app`, Apple Team `C236Q758J2`, App Store ID `6755812712`.
- The build goes to App Store Connect. Test it in TestFlight, then submit it for review.
- Export compliance is already declared in `app.json` (`ITSAppUsesNonExemptEncryption: false`).

**Play Store (Android)**
- Package `org.sikuzangu.app`.
- Upload the `.aab` in the Play Console, starting with the internal testing track, then promote it to production.
- `eas submit` can upload to Play automatically only if a Google service account key is configured in EAS. Otherwise, upload the `.aab` by hand.

For store listings, the website has a privacy policy page (`/privacy-policy`) and an account-deletion page (`/delete-account`).

## Notes

- Firebase (Crashlytics) reads `GoogleService-Info.plist` and `google-services.json`.
- When you add a dependency, run `npx nx sync-deps app-sikuzangu-org`. Web and server-only packages are excluded in `project.json`.
- `tools/scripts/eas-build-post-install.mjs` symlinks `node_modules` so that EAS builds work inside the monorepo.
