# brevo

`@siku-zangu/brevo`: transactional email through [Brevo](https://www.brevo.com). Server-only.

- `sendAdminInvite`: invites a new dashboard admin
- `sendAdminPasswordResetLink`: sends an admin password reset link
- `BREVO_TX_EMAIL_API` and `BREVO_CONFIG`: the client and its config

## Environment

| Variable | Default |
| --- | --- |
| `S_BREVO_API_KEY` | none (required) |
| `S_BREVO_SENDER_EMAIL` | `support@m.sikuzangu.org` |
| `S_BREVO_SENDER_FULL_NAME` | `Siku Zangu` |

```bash
npx nx build brevo
npx nx test brevo   # Vitest
```
