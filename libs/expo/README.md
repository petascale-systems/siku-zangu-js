# expo

`@siku-zangu/expo`: React Native building blocks for the [mobile app](../../apps/app-sikuzangu-org/README.md).

- **Components**: `InputField`, `PrimaryButton`, `CountryCodePicker`, `LanguageCard`, the app nav, `CyclePredictionSources`, and user name inputs
- **Cycle logic** (`utils/`): cycle calculations and prediction sources
- **App helpers**: onboarding state and `useAuthProtection`
- **Hooks**: `useNotifications` (Expo push) and Firebase Crashlytics

```bash
npx nx lint expo
npx nx typecheck expo
npx nx test expo
```
