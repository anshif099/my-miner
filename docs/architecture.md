# Architecture

The Next.js dashboard authenticates users with Firebase Authentication and reads owner-scoped state from Firebase Realtime Database. Sensitive changes use callable Cloud Functions v2, which derive identity from the verified Firebase token and perform ownership checks. Realtime Database is the only database.

Current layers:

- `web`: client UI, authentication session, protected routes, and device listeners.
- `backend/functions`: trusted APIs, validation, ownership enforcement, server timestamps, and audit creation.
- `shared`: Zod contracts, inferred TypeScript types, and language-neutral JSON Schema.
- `laptop-agent` and `android`: reserved boundaries only.

Cloud Messaging is part of the approved Firebase architecture but command notification begins with a device agent in Phase 3. App Check is enforced by deployed callable Functions and uses reCAPTCHA Enterprise on the web when configured. The emulator deliberately disables enforcement so offline development works.

**REAL MINING IS NOT IMPLEMENTED YET.**



Realtime Database uses Unix-millisecond timestamps. Because writing `null` deletes a child, absent optional children are normalized as unavailable/null at contract boundaries.
