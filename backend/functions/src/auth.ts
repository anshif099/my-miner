import type { CallableRequest } from "firebase-functions/v2/https";
import { unauthenticated } from "./errors.js";

export function requireUser(request: CallableRequest<unknown>): string {
  if (!request.auth?.uid) unauthenticated();
  return request.auth.uid;
}

