# Quick Start

```sh
git clone git@github.com:wenex-org/client-backend.git
```

```sh
cd client-backend
cp .env.example .env

# Clone git submodules
npm run git:clone
npm run git checkout main

# Install node dependencies
pnpm install --frozen-lockfile
```

**Next Step**:

- [Add Remote (Optional)](#add-remote-optional)
- [Start Essential Utilities](#start-essential-utilities)
- [DB Seeding and Initialization](#db-seeding-and-initialization)
- [Start Up and Running using Docker](#start-up-and-running-using-docker)
- [Manually Start Up and Running Wenex](#manually-start-up-and-running-wenex)

## Add Remote (Optional)

```sh
npm run git:remote:add staging example.com
```

> Note: stage must be `staging` or `production`.

## Start Essential Utilities

```sh
docker-compose -f docker/docker-compose.yml up -d
# The other `yml` files in `docker` directory are optional
```

## DB Seeding and Initialization

- [Using Docker](#using-docker)
- [Manual Seeding](#manual-seeding)

### Using Docker

> Note: run `docker build -t wenex/client:latest .` before using docker solution.

```sh
docker-compose --profile platform-seed up
docker-compose --profile platform-raise up
# docker-compose --profile platform-clean up
```

### Manual Seeding

```sh
npm run platform:seed
npm run platform:raise
# npm run platform:clean
```

## Start Up and Running using Docker

> Note: run `docker build -t wenex/client:latest .` before using docker solution.

Start all services at once

```sh
docker-compose --profile client up -d
```

## Manually Start Up and Running Wenex

Start each service you want using the following command

```sh
# Gateway
npm run start:dev gateway
#npm run start:debug[2] gateway

# Services
npm run start:dev services
#npm run start:debug[2] services

# Workers
npm run start:dev workers
#npm run start:debug[2] workers
```

Serve static files located at `assets` directory

```sh
npm run serve:static
```
