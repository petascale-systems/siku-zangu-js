## How to apply schema migrations

### Prerequisites
- [Install Atlasgo CLI](https://atlasgo.io/docs)
- Start your MariaDB database server
- Create a database called `sikuzangu`

### Apply migrations
```bash

# https://atlasgo.io/declarative/apply
export ATLASGO_VAR_DATABASE=siku_zangu
export ATLASGO_URL=maria://{USER}:{PWD}@{HOST}:3306/$ATLASGO_VAR_DATABASE
atlas schema apply --url="$ATLASGO_URL" \
  --to=file://atlasgo/hcl \
  --var=database="$ATLASGO_VAR_DATABASE" \
  --auto-approve \
  --tx-mode file
```

```shell
npx nx build sikuzangu-com --skip-nx-cache
docker build -t sikuzangu-com:0.0.4 -f ./sikuzangu-com-Dockerfile .
docker run --publish 3001:3000 \
--network petascale.systems \
--env S_DATABASE_HOST=mysql84 \
--env S_DATABASE_USER=root \
--env S_DATABASE_PASSWORD=PetaPlay%40%23%246yty \
--env S_DATABASE_NAME=siku_zangu \
--env ATLASGO_VAR_DATABASE=siku_zangu \
--env ATLASGO_URL=mysql://root:PetaPlay%40%23%246yty@mysql84:3306/siku_zangu \
sikuzangu-com:0.0.4
```

nx build sikuzangu-com
mv "dist/apps/sikuzangu-com/public" "dist/apps/sikuzangu-com/.next/standalone/dist/apps/sikuzangu-com"
mv "dist/apps/sikuzangu-com/.next/static" "dist/apps/sikuzangu-com/.next/standalone/dist/apps/sikuzangu-com/.next"
node dist/apps/sikuzangu-com/.next/standalone/apps/sikuzangu-com/server.js