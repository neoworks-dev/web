export interface RecentClient {
	id: string;
	name: string;
	orgId: string;
	at: number;
}

const STORAGE_KEY = 'neoworks:recent-clients';
const MAX_ENTRIES = 8;

function read(): RecentClient[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as RecentClient[]) : [];
	} catch {
		return [];
	}
}

export function getRecentClients(): RecentClient[] {
	return read().sort((a, b) => b.at - a.at);
}

// Record that the user opened a client, moving it to the front of the recents list.
export function recordRecentClient(client: { id: string; name: string; orgId: string }): void {
	if (typeof localStorage === 'undefined') return;
	const existing = read().filter((entry) => entry.id !== client.id);
	const updated = [{ ...client, at: Date.now() }, ...existing].slice(0, MAX_ENTRIES);
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
	} catch {}
}
