import { HttpsError } from "firebase-functions/v2/https";
import type { ZodError } from "zod";

export function unauthenticated(): never {
  throw new HttpsError("unauthenticated", "Authentication is required.", { code: "AUTHENTICATION_FAILED" });
}
export function invalid(error: ZodError): never {
  throw new HttpsError("invalid-argument", "Request validation failed.", { issues: error.issues });
}
export function notFound(resource: string): never {
  throw new HttpsError("not-found", `${resource} was not found.`);
}
export function forbidden(): never {
  throw new HttpsError("permission-denied", "You do not own this resource.");
}

