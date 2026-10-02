# atlasgo

The database schema, written declaratively as [Atlas](https://atlasgo.io/declarative/apply) HCL in `hcl/`. One file per table, for example `s_user.hcl`, `s_article.hcl`, `s_admin.hcl`.

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
