# Quick Start

```sh
git clone git@github.com:wenex-org/client-backend.git
```

```sh
cd client-backend
cp .env.example .env

# Clone git submodules
pnpm run git:clone
pnpm run git checkout main

# Install node dependencies
pnpm install --frozen-lockfile
```

**Next Step**:

- [Add Remote (Optional)](#add-remote-optional)
- [Start Essential Utilities](#start-essential-utilities)
- [DB Seeding and Initialization](#db-seeding-and-initialization)
- [Start Up and Running using Docker](#start-up-and-running-using-docker)
- [Manually Start Up and Running Client](#manually-start-up-and-running-client)

## Add Remote (Optional)

```sh
pnpm run git:remote:add staging example.com
```

> Note: stage must be `staging` or `production`.

## Start Essential Utilities

```sh
docker-compose -f docker/docker-compose.yml up -d
# Also required: docker/docker-compose.mg.yml (MongoDB — see docker/README.md) and
# docker/docker-compose.rds.yml (Redis). Only otlp/snq/sntr are optional. (Corrected 2026-09-20 —
# this line called them all optional while .env.example needs Mongo and Redis.)
```

## DB Seeding and Initialization

- [Using Docker](#using-docker)
- [Manual Seeding](#manual-seeding)
- [Coworkers Seeding](#coworkers-seeding)

### Using Docker

> Note: run `docker build -t wenex/client-backend:latest .` before using docker solution.

```sh
docker-compose --profile platform-seed up
docker-compose --profile platform-raise up
# docker-compose --profile platform-clean up
```

### Manual Seeding

```sh
pnpm run platform:seed
pnpm run platform:raise
# pnpm run platform:clean
```

### Coworkers Seeding

Manual:

```sh
pnpm run coworkers:seed
pnpm run coworkers:raise
# pnpm run coworkers:clean
```

Using Docker:

```sh
docker-compose --profile coworkers-seed up
docker-compose --profile coworkers-raise up
# docker-compose --profile coworkers-clean up
```

## Start Up and Running using Docker

> Note: run `docker build -t wenex/client-backend:latest .` before using docker solution.

Start all services at once

```sh
docker-compose --profile client up -d
```

## Manually Start Up and Running Client

Start each service you want using the following command

```sh
# Gateway
pnpm run start:dev gateway
#pnpm run start:debug[2] gateway

# Services
pnpm run start:dev services
#pnpm run start:debug[2] services

# Workers
pnpm run start:dev workers
#pnpm run start:debug[2] workers
```

Serve static files located at the `assets` directory

```sh
pnpm run serve:static
```
