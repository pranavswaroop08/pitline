import type { Session } from "@/types/telemetry";

/** Module-level store for server actions / API routes (same process lifetime). */
let currentSession: Session | null = null;

export function getStoredSession(): Session | null {
  return currentSession;
}

export function setStoredSession(session: Session | null): void {
  currentSession = session;
}

export function clearStoredSession(): void {
  currentSession = null;
}
