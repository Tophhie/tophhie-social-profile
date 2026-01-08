
import { writable } from 'svelte/store';

export type SessionUser = {
  did: string;
  repo?: any;
  accessJwt?: string;  // if using createSession
  oauth?: { provider: 'bluesky'; tokenType: string; accessToken: string };
};

export const user = writable<SessionUser | null>(null);