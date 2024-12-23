# App Image
FROM node:22-alpine AS build

WORKDIR /app

COPY . .

RUN apk update && apk add bash

RUN npm install -g pnpm && \
  pnpm install --frozen-lockfile

# Service Image
FROM build

ARG SERVICE_NAME

ENV OTLP_SERVICE_NAME=${SERVICE_NAME}
ENV ELASTIC_APM_SERVICE_NAME=${SERVICE_NAME}

CMD npm run start ${SERVICE_NAME}
