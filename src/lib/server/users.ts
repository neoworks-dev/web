import { RecordId, Surreal } from 'surrealdb';
import bcrypt from 'bcrypt';
import { users } from '$lib/db/tables';

const db = new Surreal();

export async function connectDB() {
    if (db.status === "connected") return;

    await db.connect(process.env.SURREAL_URL ?? 'ws://localhost:8000');
    await db.signin({
        username: process.env.SURREAL_USER ?? 'root',
        password: process.env.SURREAL_PASS ?? 'root',
    });
    await db.use({
        namespace: process.env.SURREAL_NS ?? 'neoworks',
        database: process.env.SURREAL_DB ?? 'auth',
    });
}

export type User = {
    id: string | RecordId<"users">;
    email: string;
    password_hash: string;
    created_at: string;
};

export async function getUserByEmail(email: string): Promise<User | null> {
    // WHERE clause needed so query is the right call here
    const result = await db.query<[User[]]>(
        'SELECT * FROM users WHERE email = $email LIMIT 1',
        { email }
    );
    return result[0]?.[0] ?? null;
}

export async function createUser(email: string, password: string): Promise<User> {
    const hash = await bcrypt.hash(password, 12);

    const result = await db.create<User>(users).content({
        email,
        password_hash: hash,
        created_at: new Date().toISOString(),
    });

    if (!result) throw new Error('Failed to create user');
    return result[0] as User;
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
    const user = await getUserByEmail(email);
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password_hash);
    return valid ? user : null;
}

export async function getUserByID(id: string): Promise<User | null> {
	const result = await db.select<User>(new RecordId('users', id.replace('users:', '')));
	
	if (!result) {
		return null;
	}
	
	return {
		id: result.id.id,
		email: result.email,
		password_hash: result.password_hash,
		created_at: result.created_at,
    };
}

export async function createSession(token: string, userId: string): Promise<void> {
    await db.create(new RecordId('sessions', token)).content({
        user_id:    userId,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    });
}

export async function getUserBySession(token: string): Promise<User | null> {
    const result = await db.query<[{ user_id: string }[]]>(`
        SELECT user_id FROM sessions
        WHERE id = $id AND expires_at > time::now()
        LIMIT 1
    `, { id: new RecordId('sessions', token) });

    const session = result[0]?.[0];
    if (!session) return null;

    return getUserByID(session.user_id);
}

export async function deleteSession(token: string): Promise<void> {
    await db.delete(new RecordId('sessions', token));
}