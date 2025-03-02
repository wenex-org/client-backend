FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN apk update && apk add bash

RUN npm install -g pnpm@10.5.2 && \
  pnpm install --frozen-lockfile

FROM build

COPY . .

ARG SERVICE_NAME

ENV OTLP_SERVICE_NAME=${SERVICE_NAME}
ENV ELASTIC_APM_SERVICE_NAME=${SERVICE_NAME}

CMD npm run start ${SERVICE_NAME}
