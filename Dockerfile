# App Image
FROM node:18-alpine AS build

WORKDIR /app

COPY pnpm*.yaml ./

RUN curl -fsSL https://get.pnpm.io/install.sh | sh -
RUN pnpm install --frozen-lockfile --prod

# Service Image
FROM build

COPY . .

CMD npm run start
