# Wenex - Client Backend

This project contains two microservices under the NestJS Monorepo structure:

- Proxy: This project can be run with the command `npm run start apps/client`.
- Craft: This project implemented business logic from the old project and can be run with the command `npm run start apps/crafts`.

## Preparing

to prepare the platform for the client you must run the bellow command just once when the platform is up.

```sh
npm run setup
```

> Note: `setup` will seed and change some data of client properties in the platform.

## Up & Running

```sh
# Clone the repository
git clone git@gitlab.com:coinoverse-back-end/admin-client-backend.git

# install dependencies
cd admin-client-backend && pnpm install

# Start the proxy service
npm run start apps/client &

# Start the client services
npm run start apps/crafts
```
