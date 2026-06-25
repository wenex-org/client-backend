# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-06-25

### Added

- add /mcp gateway route streaming MCP traffic to the platform as live SSE, with Mcp-Session-Id preserved. @vhidvz

### Changed

- stream gateway file uploads straight through to platform instead of buffering and re-uploading them. @vhidvz

## [1.1.X] - 2026-06-23

### Added

- coworkers sync domain/apps resource @vhidvz
- add comment of post @fdaei
- add validation for COWORKERS environment variable @mhalizadeh
- add `SpecialStat` scop @fdaei
- add `ReadConjointAccounts` to lnd @winkcor
- add `tpfy` client to coworkers commands @vhidvz
- add `init` and `verify` transaction scope to phc coworker @vhidvz
- add `search:conjoint:messages` scope to `PHC Client` @winkcor
- add `lnd` client to coworker clients @vhidvz
- add `coworkers:sync` command @vhidvz
- add `rsch` client to coworker clients @vhidvz
- add `special/files.share` scope to `PHC Client` @vhidvz
- added `queue` to nats options @vhidvz
- enable trust proxy for real client IP @fdaei
- `PaymentFinancialInvoices` scope added to the PHC client scope @winkcor
- remove `axios-retry` @fdaei
- `GenerateConjointAccounts` scope added to PHC coworker @vhidvz
- add git update script and update package.json @vhidvz
- Added `ManageConjoint` to the PHC backend scope @fdaei
- `ManageCareerBranch` scope added to `PHC Client` @iranmanesh-dev
- `GRAPHQL_MUTATION_SUPPORT` added to environments @vhidvz
- financial coworker commands @vhidvz
- cqrs config command for phc coworker @vhidvz
- new `Essential` scope to `PHC Client` @iranmanesh-dev
- `career` scopes added to `PHC Client` @iranmanesh-dev
- phc coworker financial currencies command @vhidvz
- `write:financial` and `write:conjoint` scope to phc coworker @vhidvz
- coworkers command for `PHC Client` @vhidvz

### Changed

- add `SearchContentPosts` and `ManageContentPosts` to phc client
- update backup service @vhidvz
- update wenex sdk version @vhidvz
- add tapify client to phc currencies `clients` props @vhidvz
- add `-` prefix to proxied API routes @mhalizadeh
- define `tapify` as `phc` coworker @vhidvz
- add `hai` client to coworker clients @fdaei
- update `clients.seed.ts` to add `AbortFinancialTransaction` for phc @yonus-a
- update `libs/module` using update script @vhidvz
- update `@wenex/sdk` to version `1.3.0` @vhidvz
- copd coworker scopes updated base on phc client @vhidvz
- Upgrade some files @fdaei
- update wenex sdk to latest version @vhidvz
- add phc client id to all phc coworker data @vhidvz
- update mongodb options @vhidvz
- update mongodb options @vhidvz
- add `MONGO_LOAD_BALANCED` env @vhidvz
- update docker file and start script to handle termination signal @vhidvz
- remove text indexes from backup @fdaei
- improve error logging in SdkService and adjust constructor formatting @vhidvz
- improve error handling in sdk module @vhidvz
- altcha max number default to 100000 with `ALTCHA_MAX_NUMBER` env @vhidvz
- `identity` property moved to core schema as **optional mongo id string** @vhidvz
- support initialization envs for coworkers @vhidvz
- coworkers scope update @vhidvz
- support hot reload on scope change within refresh token @vhidvz
- refactor: update DB_NAME function to use default prefix and adjust related tests @vhidvz
- refactor: change collection type in CqrsSourceDto and CqrsSource interface @vhidvz
- refactor: update BackupService to use new collection structure and improve index management @vhidvz
- refactor: simplify ensureIndexes function signature for better type handling @vhidvz

### Fixed

- fix: phc `financial` scopes @vhidvz
- fix: tapify seed data on `identity.users` subject field @vhidvz
- fix: cursor proxy header @vhidvz
- fix: coworkers cqrs conflict port @vhidvz
- `loadBalanced is only a valid option in the URI` issue @vhidvz
- `afterSync` mixed headers from platform issues @vhidvz
- coworkers auth command issues @vhidvz

## [1.0.X] - 2024-01-01

### Added

- initial release 🎉​🎊​.

[unreleased]: https://github.com/wenex-org/client-backend/compare/1.2.0...HEAD
[1.2.0]: https://github.com/wenex-org/client-backend/compare/1.1.42...1.2.0
[1.1.X]: https://github.com/wenex-org/client-backend/compare/1.0.21...1.1.42
[1.0.X]: https://github.com/wenex-org/client-backend/releases/tag/1.0.21
