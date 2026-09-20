# Docker

Start all container needs by `docker-compose -f docker/docker-compose.yml up -d` command.

- [NATS](#nats) — what `docker/docker-compose.yml` actually brings up
- [MongoDB](#mongodb) — `docker/docker-compose.mg.yml`
- Also present, undocumented here: `docker-compose.{nat,otlp,rds,snq,sntr}.yml`

## MongoDB

```sh
docker-compose -f docker/docker-compose.mg.yml up -d
```

Add these lines to `/etc/hosts`:

```sh
127.0.0.1 mongodb-primary
127.0.0.1 mongodb-secondary
```

> Connection URL: `mongodb://root:password123@mongodb-primary:27017,mongodb-secondary:27018/?replicaSet=rs0&authSource=admin`

## NATS

What `docker/docker-compose.yml` actually brings up: it extends `docker-compose.nat.yml` for
`nats`, `nats-1`, `nats-2` on `4222` — and nothing else. Mongo and Redis come from
`docker-compose.mg.yml` / `docker-compose.rds.yml` (see the README's start step). *(Section added
2026-09-20 — the contents line above listed MongoDB only, and the compose brings NATS.)*
