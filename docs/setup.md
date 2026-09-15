# Local setup

## Prerequisites

- Node.js 22 or newer
- npm
- Java 21 or newer for the Firebase Emulator Suite

## Install and configure

1. Run `npm install` in the repository root.
2. Copy `.env.example` to `web/.env.local`.
3. Keep `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` for local development.
4. Run `npm run emulators` in one terminal.
5. Run `npm run dev` in another terminal.
6. Open `http://localhost:3000` and register an emulator-only account.

To enable the development-only Add Device function, set `ALLOW_DEV_DEVICE_CREATION=true` when starting the Functions emulator. The function also verifies `FUNCTIONS_EMULATOR=true`, so it cannot become a production registration bypass.

No production Firebase connection is required for local development.

## Production configuration

Create a Firebase project, enable Email/Password Authentication, Realtime Database, Functions, App Check, and a Web app. Replace only the public `NEXT_PUBLIC_FIREBASE_*` identifiers in the deployment environment. Configure the reCAPTCHA Enterprise site key, register allowed domains, update `.firebaserc`, and deploy Database rules and Functions after emulator verification.

Never download a service-account key into `web`, commit secrets, or expose Admin credentials to the browser.

