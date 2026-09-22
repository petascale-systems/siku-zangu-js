# atlasgo

The database schema and the data migrations that go with it.

- `hcl/` — the schema, written declaratively as [Atlas](https://atlasgo.io/declarative/apply) HCL. One file per table, for example `s_user.hcl`, `s_article.hcl`, `s_admin.hcl`.
- `sql/` — data migrations. Atlas reshapes tables but will not move data between them, so anything that has to be carried across a schema change lives here as plain SQL.

To change the schema, edit the HCL and apply it. Atlas works out the diff.

```bash
export ATLASGO_VAR_DATABASE=siku_zangu
export ATLASGO_URL="mysql://root:<url-encoded-password>@localhost:3306/$ATLASGO_VAR_DATABASE"

atlas schema apply --url="$ATLASGO_URL" \
  --to=file://atlasgo/hcl \
  --var=database="$ATLASGO_VAR_DATABASE" \
  --auto-approve \
  --tx-mode file
```

The database must already exist. The Docker image runs this same command on startup (`sikuzangu-org-docker-entrypoint.sh`).

Atlas only reads `file://atlasgo/hcl`, so `sql/` is invisible to it.

## Data migrations

The entrypoint runs each file in `sql/` immediately after applying the schema,
with the `mysql` client. Two rules they all follow:

- **Idempotent.** They run on every deploy, so a second run must be a no-op.
- **Non-fatal.** The entrypoint invokes them with `|| true`; a data migration
  must never be able to stop the service booting. A failed run is simply
  retried on the next deploy.

To run one by hand:

```bash
mysql --host=... --user=... --database="$ATLASGO_VAR_DATABASE" \
  < atlasgo/sql/backfill-user-logs.sql
```
