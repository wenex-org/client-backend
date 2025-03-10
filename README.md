# Client Backend

## Installation

### 1. Clone the Repository

Clone the necessary repositories by running:

```sh
npm run git:clone
```

### 2. Start Services

Run the following commands to start the backend services in development mode:

```sh
npm run start:dev gateway
npm run start:dev services
npm run start:dev worker
```

### 3. Initialize Platform

Seed and raise the platform with:

```sh
npm run platform:seed && npm run platform:raise
```

## Notes

- Ensure all dependencies are installed before running the services.
- Make sure required external services (e.g., databases, message queues) are running before starting the backend.
