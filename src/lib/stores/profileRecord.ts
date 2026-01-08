import { writable } from 'svelte/store';
import type { TophhieSocialProfile } from './profile';

export const profileRecord = writable<TophhieSocialProfile | null>(null);