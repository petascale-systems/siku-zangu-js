# Siku Zangu

**Empowering women, one cycle at a time.**

Siku Zangu ("my days" in Kiswahili) is a digital health app that helps African women and girls track their menstrual cycles, understand their bodies, and make informed decisions about their reproductive health. It is bilingual (English and Kiswahili), designed with respect for local culture, and built for privacy.

- **iOS:** [App Store](https://apps.apple.com/us/app/siku-zangu/id6755812712)
- **Android:** [Google Play](https://play.google.com/store/apps/details?id=org.sikuzangu.app)
- **Web:** [sikuzangu.org](https://sikuzangu.org)

**Mission:** to give women and girls in Africa culturally relevant, accessible, and intelligent tools to understand their cycles and improve their reproductive health, so they can live with dignity, confidence, and control over their health.

**Vision:** every woman and girl in Africa, whatever her age, income, or location, can manage her menstrual and reproductive health with confidence, care, and cultural pride.

## Features

| Feature | What users get | Where it lives |
| --- | --- | --- |
| Cycle tracking | Mark period start and end on a calendar; see the next period and fertile window | `tabs/calendar`, [libs/expo](libs/expo/README.md) `utils/cycle-calculations.ts` |
| Evidence-based predictions | Estimates from the user's own cycle history, using methods from cited peer-reviewed research | `utils/cycle-prediction-sources.ts` |
| Daily logging | Log moods, flow, and physical symptoms with visual icons; spot patterns over time | `tabs/log-entry` |
| Insights and articles | Cycle-phase tips and health articles written by the team in the admin dashboard | `tabs/insights`, `article-detail` |
| Reminders | Push notifications for upcoming periods, the fertile window, medication, insights, and new articles | notification cron in [sikuzangu-org](apps/sikuzangu-org/README.md) |
| Bilingual | The whole app in English and Kiswahili, switchable at any time | `libs/expo/src/i18n` |
| Privacy | Data handled in line with Tanzania's PDPA (2023) and Kenya's DPA (2019); users can delete their account in the app or on the web | `/privacy-policy`, `/delete-account` |
| Admin dashboard | Manage users, admins, articles, and notifications, and view trends | `/dashboard` in sikuzangu-org |

## Tech stack

| Layer | Technology |
| --- | --- |
| Mobile | Expo SDK 54, React Native, expo-router |
| Web and API | Next.js 16, React 19, Tailwind CSS |
| Data | MySQL/MariaDB, Knex, Atlas (declarative schema) |
| Services | Firebase (push and Crashlytics), Brevo (email), Twilio Verify (SMS OTP) |
| Tooling | Nx 22 monorepo, TypeScript 5.9, Vitest/Jest, Playwright |
| Delivery | Docker image hosted on Railway; mobile builds and store submission through EAS |

## Projects

| Project | Path | What it is |
| --- | --- | --- |
| `sikuzangu-org` | [apps/sikuzangu-org](apps/sikuzangu-org/README.md) | Next.js website, admin dashboard, and REST API |
| `app-sikuzangu-org` | [apps/app-sikuzangu-org](apps/app-sikuzangu-org/README.md) | Expo mobile app for iOS and Android |
| `sikuzangu-org-e2e` | [apps/sikuzangu-org-e2e](apps/sikuzangu-org-e2e/README.md) | Playwright end-to-end tests for the website |
| `core` | [libs/core](libs/core/README.md) | Shared Zod models and API error helpers |
| `knex` | [libs/knex](libs/knex/README.md) | Database access (MySQL/MariaDB) and push notifications |
| `brevo` | [libs/brevo](libs/brevo/README.md) | Transactional email |
| `react` | [libs/react](libs/react/README.md) | Web components, data hooks, and fetch helpers |
| `expo` | [libs/expo](libs/expo/README.md) | React Native components and cycle calculations |
| — | [atlasgo](atlasgo/README.md) | Database schema (Atlas HCL) |

## Prerequisites

- Node 22 and npm
- MySQL or MariaDB
- [Atlas CLI](https://atlasgo.io/docs) for schema migrations

## Quick start

```bash
npm install
# create the database schema (see atlasgo/README.md)
npx nx serve sikuzangu-org      # website and API on http://localhost:3000
npx nx start app-sikuzangu-org  # mobile app (Metro)
```

Useful commands:

```bash
npx nx show projects            # list projects
npx nx show project <name>      # list a project's targets
npx nx run-many -t lint         # lint everything
npx nx run-many -t test         # run all unit tests
```

Code conventions (file naming, component prefixes, providers) are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Deployment

[sikuzangu-org-Dockerfile](sikuzangu-org-Dockerfile) builds `sikuzangu-org` from source and packages it, so the image needs nothing built beforehand. On startup the container applies the Atlas schema, then starts the server. Configuration comes from environment variables on the host. See [apps/sikuzangu-org](apps/sikuzangu-org/README.md) for the variables and how to run the container locally.

Mobile builds go through EAS. See [apps/app-sikuzangu-org](apps/app-sikuzangu-org/README.md).

## Ownership

Siku Zangu is owned by Osilgi Solutions Co. Limited, P.O. Box 708, Arusha, Tanzania. Contact: [sikuzangu@gmail.com](mailto:sikuzangu@gmail.com).
