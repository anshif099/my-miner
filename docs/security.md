# Security model

- Firebase Authentication stores and verifies email/password credentials; Realtime Database never stores passwords.
- Realtime Database rules deny by default and expose only existing documents whose `ownerId` matches the authenticated user.
- Direct client writes are denied for devices, commands, sessions, earnings, wallets, schedules, settings, audit logs, profitability, telemetry, and pairing codes.
- Trusted Functions validate inputs, derive ownership, and use server timestamps.
- Audit logs are append-only from the client's perspective.
- Deployed callable Functions enforce Firebase App Check.
- Admin SDK code exists only in `backend/functions`.
- `.env` files and service credentials are ignored by Git.

The development device creator requires both an explicit environment flag and the Firebase Functions emulator. It is not a production pairing protocol.

