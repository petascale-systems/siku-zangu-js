## How to apply schema migrations

### Prerequisites
- [Install Atlasgo CLI](https://atlasgo.io/docs)
- Start your MariaDB database server
- Create a database called `sikuzangu`

### Apply migrations
```bash

# https://atlasgo.io/declarative/apply
export ATLASGO_VAR_DATABASE=siku_zangu
export ATLASGO_URL=mysql://root:PetaPlay%40%23%246yty@localhost:33006/$ATLASGO_VAR_DATABASE
atlas schema apply --url="$ATLASGO_URL" \
  --to=file://atlasgo/hcl \
  --var=database="$ATLASGO_VAR_DATABASE" \
  --auto-approve \
  --tx-mode file
```

```shell
npx nx build sikuzangu-org --skip-nx-cache
docker build -t sikuzangu-org:0.0.4 -f ./sikuzangu-org-Dockerfile .
docker run --publish 3001:3000 \
--network petascale.systems \
--env S_DATABASE_HOST=mysql84 \
--env S_DATABASE_USER=root \
--env S_DATABASE_PASSWORD=PetaPlay%40%23%246yty \
--env S_DATABASE_NAME=siku_zangu \
--env ATLASGO_VAR_DATABASE=siku_zangu \
--env ATLASGO_URL=mysql://root:PetaPlay%40%23%246yty@mysql84:3306/siku_zangu \
sikuzangu-org:0.0.4
```

nx build sikuzangu-org
mv "dist/apps/sikuzangu-org/public" "dist/apps/sikuzangu-org/.next/standalone/dist/apps/sikuzangu-org"
mv "dist/apps/sikuzangu-org/.next/static" "dist/apps/sikuzangu-org/.next/standalone/dist/apps/sikuzangu-org/.next"
node dist/apps/sikuzangu-org/.next/standalone/apps/sikuzangu-org/server.js