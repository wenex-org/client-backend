# Gateway
pnpm run dpdm:ts ./apps/gateway/src/main.ts -- --progress > circular-dependencies.txt

# Services
pnpm run dpdm:ts ./apps/services/src/main.ts -- --progress >> circular-dependencies.txt

# Workers
pnpm run dpdm:ts ./apps/workers/src/main.ts -- --progress >> circular-dependencies.txt

# Madge
pnpm run madge:report:ts
