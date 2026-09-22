# Siku Zangu

A period and cycle tracking app. This Nx monorepo holds the mobile app, the website with its admin dashboard and API, and the libraries they share.

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
```

## Deployment

Pushing a git tag starts the Drone pipeline in [.drone.yml](.drone.yml). It builds `sikuzangu-org`, packages it with [sikuzangu-org-Dockerfile](sikuzangu-org-Dockerfile), and runs the container. On startup the container applies the Atlas schema, then starts the server. Secrets are stored in Drone. See [apps/sikuzangu-org](apps/sikuzangu-org/README.md) for the environment variables and how to run the container locally.

Mobile builds go through EAS. See [apps/app-sikuzangu-org](apps/app-sikuzangu-org/README.md).
