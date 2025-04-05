#!/bin/bash

npm run build gateway

# Build services
services=("services" "workers")
for service in "${services[@]}"; do
  npm run build "$service" &
done

# Wait for all background jobs to complete
wait
