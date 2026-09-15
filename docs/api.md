# Trusted callable API

Every callable requires Firebase Authentication. Deployed functions also require App Check. Ownership is always derived from `request.auth.uid`.

| Function | Input | Response |
|---|---|---|
| `ensureUserProfile` | `{}` | `{ ok }` |
| `recordLogin` | `{}` | `{ ok }` |
| `createDevice` | `{ deviceName, deviceType }` | `{ deviceId, developmentOnly }` |
| `getDevices` | `{}` | `{ devices }` |
| `createCommand` | `{ deviceId, type, payload }` | `{ commandId, status, expiresAt }` |
| `getDeviceStatus` | `{ deviceId }` | `{ device }` |
| `getMiningSession` | `{ id }` | `{ session }` |
| `getEarnings` | `{}` | `{ earnings }` |
| `getSchedules` | `{}` | `{ schedules }` |
| `getSettings` | `{}` | `{ settings }` |
| `updateSettings` | validated settings fields | `{ ok }` |
| `getAuditLogs` | `{}` | `{ auditLogs }` |

`createCommand` creates only a durable pending request. It does not run a miner. IDs, owner, sequence, timestamps, expiry, and audit data are server-assigned.

