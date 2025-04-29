#!/bin/bash

SERVICE_NAME=${1:-gateway}

if [ $SERVICE_NAME == "gateway" ]; then
  node --stack-size=4096 dist/apps/gateway/main.js
elif [ $SERVICE_NAME == "services" ]; then
  node --stack-size=4096 dist/apps/services/main.js
elif [ $SERVICE_NAME == "workers" ]; then
  node --stack-size=4096 dist/apps/workers/main.js
else
  echo -e "Service or Worker not found...!\n" && exit 1
fi
