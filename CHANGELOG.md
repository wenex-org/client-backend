# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- financial coworker commands @vhidvz

## [1.1.9] - 2025-07-30

### Added

- `career` scopes added to `PHC Client` @iranmanesh-dev
- phc coworker financial currencies command @vhidvz

## [1.1.8] - 2025-07-24

### Changed

- `identity` property moved to core schema as **optional mongo id string** @vhidvz

## [1.1.7] - 2025-07-23

### Added

- `write:financial` and `write:conjoint` scope to phc coworker @vhidvz

## [1.1.6] - 2025-07-23

### Changed

- coworkers scope update @vhidvz

## [1.1.5] - 2025-07-19

### Changed

- support initialization envs for coworkers @vhidvz

## [1.1.4] - 2025-07-17

### Changed

- coworkers scope @vhidvz

## [1.1.3] - 2025-07-17

### Changed

- support hot reload on scope change within refresh token @vhidvz

## [1.1.2] - 2025-07-17

### Fixed

- coworkers auth command issues @vhidvz

## [1.1.1] - 2025-07-17

### Added

- coworkers command for `PHC Client` @vhidvz

## [1.1.0] - 2025-06-02

### Changed

- refactor: update DB_NAME function to use default prefix and adjust related tests @vhidvz
- refactor: change collection type in CqrsSourceDto and CqrsSource interface @vhidvz
- refactor: update BackupService to use new collection structure and improve index management @vhidvz
- refactor: simplify ensureIndexes function signature for better type handling @vhidvz

## [1.0.X] - 2024-01-01

### Added

- initial release 🎉​🎊​.

[unreleased]: https://github.com/wenex-org/client-backend/compare/1.1.9...HEAD
[1.1.9]: https://github.com/wenex-org/client-backend/compare/1.1.8...1.1.9
[1.1.8]: https://github.com/wenex-org/client-backend/compare/1.1.7...1.1.8
[1.1.7]: https://github.com/wenex-org/client-backend/compare/1.1.6...1.1.7
[1.1.6]: https://github.com/wenex-org/client-backend/compare/1.1.5...1.1.6
[1.1.5]: https://github.com/wenex-org/client-backend/compare/1.1.4...1.1.5
[1.1.4]: https://github.com/wenex-org/client-backend/compare/1.1.3...1.1.4
[1.1.3]: https://github.com/wenex-org/client-backend/compare/1.1.2...1.1.3
[1.1.2]: https://github.com/wenex-org/client-backend/compare/1.1.1...1.1.2
[1.1.1]: https://github.com/wenex-org/client-backend/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/wenex-org/client-backend/compare/1.0.21...1.1.0
[1.0.X]: https://github.com/wenex-org/client-backend/releases/tag/1.0.21
