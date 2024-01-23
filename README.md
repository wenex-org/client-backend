# Wenex - Client Backend

This project contains two microservices under the NestJS Monorepo structure:

- Proxy: This project can be run with the command `npm run start gateway`.
- Craft: This project implemented business logic from the old project and can be run with the command `npm run start services`.

## Preparing

to prepare the platform for the client you must run the bellow command just once when the platform is up.

```sh
npm run prepare:platform
```

> Note: `prepare:platform` will seed and change some data of client properties in the platform.

## Up & Running

```sh
# Clone the repository
git clone git@gitlab.com:wenex-org/client-backend.git

# install dependencies
cd client-backend && pnpm install
```
