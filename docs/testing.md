# Testing

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:rules`, and `npm run build` from the repository root.

`test:rules` starts a temporary Realtime Database emulator and tests unauthenticated denial, cross-user isolation, owner reads, direct command/device denial, immutable server data, and pairing-code secrecy. Unit tests cover auth protection, enums, command validation/expiry, client ownership-field stripping, settings limits, and stale device status.

Playwright is configured for browser acceptance tests. Run `npm run test:e2e -w @miner/web` while the full Auth, Realtime Database, and Functions emulators are available.

