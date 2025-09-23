## How to apply schema migrations

### Prerequisites
- [Install Atlasgo CLI](https://atlasgo.io/docs)
- Start your MariaDB database server
- Create a database called `sikuzangu`

### Apply migrations
```bash

# https://atlasgo.io/declarative/apply
export ATLASGO_VAR_DATABASE=siku_zangu
export ATLASGO_URL=maria://{DB user}:{DB password}@:3306/$ATLASGO_VAR_DATABASE
atlas schema apply --url="$ATLASGO_URL" \
  --to=file://atlasgo/hcl \
  --var=database="$ATLASGO_VAR_DATABASE" \
  --auto-approve \
  --tx-mode file
```