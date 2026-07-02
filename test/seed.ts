#!/usr/bin/env node
/**
 * seed-posts.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Seeds the versioned `post` table with 5,000,000 random rows distributed
 * across ~1,500,000 `post_ref` entities, so each entity has 1–N versions
 * (skewed: most have 1–2, a few have many — mirrors realistic edit history).
 *
 * Setup:
 *   npm init -y
 *   npm install surrealdb
 *   npm install -D typescript tsx @types/node
 *   npx tsx seed-posts.ts
 *
 * Env (with defaults):
 *   SURREAL_URL   = ws://localhost:8000/rpc
 *   SURREAL_USER  = root
 *   SURREAL_PASS  = root
 *   SURREAL_NS    = test
 *   SURREAL_DB    = test
 *
 * Schema assumed to exist (uncomment SETUP_SCHEMA below to create it):
 *   - post_ref, post, user, user_ref  (per the versioning design)
 * ─────────────────────────────────────────────────────────────────────────
 */

import { Surreal, RecordId } from 'surrealdb';
import { randomBytes, randomInt } from 'node:crypto';

// ─── Config ─────────────────────────────────────────────────────────────
const URL      = process.env.SURREAL_URL  ?? 'ws://localhost:8000/rpc';
const USERNAME = process.env.SURREAL_USER ?? 'root';
const PASSWORD = process.env.SURREAL_PASS ?? 'root';
const NS       = process.env.SURREAL_NS   ?? 'test';
const DBNAME   = process.env.SURREAL_DB   ?? 'test';

const TOTAL_POSTS = 1_000_000;
const REF_COUNT   = 100_000;   // avg ~3.33 versions per ref
const USER_COUNT  = 1_000;       // pool of authors
const BATCH_SIZE  = 1_000;       // rows per INSERT
const CONCURRENCY = 4;           // parallel writers

// Set to `true` to (re)create the schema before seeding. Idempotent-ish:
// it will fail if tables already exist with conflicting definitions.
const SETUP_SCHEMA = true;

// ─── Random helpers ─────────────────────────────────────────────────────
const newId = () => randomBytes(8).toString('hex');  // 16-char hex IDs

const ADJ  = ['fast','quiet','bright','calm','sharp','clever','silent','bold','heavy','light','warm','cold','soft','hard','clear','dark','rough','smooth','strange','steady'];
const NOUN = ['fox','river','engine','signal','tower','garden','market','channel','beacon','vessel','pattern','horizon','circuit','gateway','archive','protocol','vector','module','session','cluster'];
const VERB = ['discovers','breaks','rebuilds','observes','tunes','reroutes','encrypts','restores','assembles','disrupts','queries','signs','validates','migrates','snapshots','replays','indexes','syncs','merges','forks'];
const TAG_POOL = ['oauth','identity','versioning','audit','rbac','beta','draft','published','archived','urgent','review','external','internal','public','private'];

const pick = <T>(a: T[]): T => a[randomInt(a.length)];
const title = () => `${pick(ADJ)} ${pick(NOUN)} ${pick(VERB)} ${pick(NOUN)}`;
const body  = () => {
  const n = 2 + randomInt(4);
  let s = '';
  for (let i = 0; i < n; i++) s += `The ${pick(ADJ)} ${pick(NOUN)} ${pick(VERB)} a ${pick(ADJ)} ${pick(NOUN)}. `;
  return s.trimEnd();
};
const tags = () => {
  const n = randomInt(4);
  const out = new Set<string>();
  for (let i = 0; i < n; i++) out.add(pick(TAG_POOL));
  return [...out];
};

// ─── Distribute TOTAL_POSTS across REF_COUNT refs (skewed) ─────────────
function buildVersionsPerRef(): Uint16Array {
  const counts = new Uint16Array(REF_COUNT);
  counts.fill(1);
  let extra = TOTAL_POSTS - REF_COUNT;
  while (extra > 0) {
    const idx = randomInt(REF_COUNT);
    const add = Math.min(extra, 1 + randomInt(8));
    counts[idx] += add;
    extra -= add;
  }
  return counts;
}

// ─── DB ────────────────────────────────────────────────────────────────
async function connect(): Promise<Surreal> {
  const db = new Surreal();
  await db.connect(URL);
  await db.signin({ username: USERNAME, password: PASSWORD });
  await db.use({ namespace: NS, database: DBNAME });
  return db;
}

const SCHEMA_SQL = `
DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD name ON user TYPE string;

DEFINE TABLE user_ref SCHEMAFULL;
DEFINE FIELD head ON user_ref TYPE record<user>;

DEFINE TABLE post_ref SCHEMAFULL;
DEFINE FIELD head       ON post_ref TYPE record<post>;
DEFINE FIELD created_at ON post_ref TYPE datetime VALUE time::now() READONLY;
DEFINE FIELD created_by ON post_ref TYPE record<user>               READONLY;
DEFINE FIELD deleted_at ON post_ref TYPE option<datetime>;

DEFINE TABLE post SCHEMAFULL;
DEFINE FIELD ref        ON post TYPE record<post_ref>          READONLY;
DEFINE FIELD seq        ON post TYPE int                       READONLY;
DEFINE FIELD parents     ON post TYPE array<record<post>>      READONLY;
DEFINE FIELD created_at ON post TYPE datetime VALUE time::now() READONLY;
DEFINE FIELD created_by ON post TYPE record<user>              READONLY;
DEFINE FIELD message    ON post TYPE option<string>            READONLY;
DEFINE FIELD title      ON post TYPE string                    READONLY;
DEFINE FIELD body       ON post TYPE string                    READONLY;
DEFINE FIELD tags       ON post TYPE array<string>             READONLY;
DEFINE FIELD author     ON post TYPE record<user_ref>          READONLY;

DEFINE INDEX idx_post_ref_seq ON TABLE post COLUMNS ref, seq UNIQUE;
DEFINE INDEX idx_post_title   ON TABLE post COLUMNS title;
DEFINE INDEX idx_post_author  ON TABLE post COLUMNS author;
`;

async function setupSchema(db: Surreal) {
  console.log('Setting up schema...');
  await db.query(SCHEMA_SQL);
}

// ─── Seed users + user_refs ─────────────────────────────────────────────
async function seedUsers(db: Surreal): Promise<{ userIds: string[]; userRefIds: string[] }> {
  console.log(`Seeding ${USER_COUNT} users + user_refs...`);
  const userIds: string[] = [];
  const userRefIds: string[] = [];
  const users: any[] = [];
  const userRefs: any[] = [];

  for (let i = 0; i < USER_COUNT; i++) {
    const uid  = newId();
    const urid = newId();
    userIds.push(uid);
    userRefIds.push(urid);
    users.push({ id: new RecordId('user', uid), name: `User ${i}` });
    userRefs.push({ id: new RecordId('user_ref', urid), head: new RecordId('user', uid) });
  }

  for (let i = 0; i < users.length; i += 500) {
    await db.query('INSERT INTO user $rows',     { rows: users.slice(i, i + 500) });
    await db.query('INSERT INTO user_ref $rows', { rows: userRefs.slice(i, i + 500) });
  }
  return { userIds, userRefIds };
}

// ─── Seed a slice of refs (+ all their post versions) ──────────────────
type Slice = { refStart: number; refEnd: number; counts: Uint16Array };

async function seedSlice(
  db: Surreal,
  slice: Slice,
  userIds: string[],
  userRefIds: string[],
  onProgress: (n: number) => void,
) {
  const refsBatch: any[]  = [];
  const postsBatch: any[] = [];

  const flush = async () => {
    if (refsBatch.length) {
      await db.query('INSERT INTO post_ref $rows', { rows: refsBatch });
      refsBatch.length = 0;
    }
    if (postsBatch.length) {
      const n = postsBatch.length;
      await db.query('INSERT INTO post $rows', { rows: postsBatch });
      postsBatch.length = 0;
      onProgress(n);
    }
  };

  for (let i = slice.refStart; i < slice.refEnd; i++) {
    const refId       = newId();
    const versionIds  = Array.from({ length: slice.counts[i] }, () => newId());
    const headId      = versionIds[versionIds.length - 1];
    const ownerUserId = pick(userIds);

    refsBatch.push({
      id:         new RecordId('post_ref', refId),
      head:       new RecordId('post', headId),
      created_by: new RecordId('user', ownerUserId),
    });

    for (let v = 0; v < versionIds.length; v++) {
      postsBatch.push({
        id:         new RecordId('post', versionIds[v]),
        ref:        new RecordId('post_ref', refId),
        seq:        v + 1,
        parents:     v === 0 ? [] : [new RecordId('post', versionIds[v - 1])],
        created_by: new RecordId('user', pick(userIds)),
        title:      title(),
        body:       body(),
        tags:       tags(),
        author:     new RecordId('user_ref', pick(userRefIds)),
      });
    }

    if (postsBatch.length >= BATCH_SIZE) await flush();
  }
  await flush();
}

// ─── Main ───────────────────────────────────────────────────────────────
async function main() {
  const t0 = Date.now();
  const db0 = await connect();
  if (SETUP_SCHEMA) await setupSchema(db0);
  const { userIds, userRefIds } = await seedUsers(db0);
  await db0.close();

  console.log('Building version distribution...');
  const counts = buildVersionsPerRef();

  console.log(`Seeding ${TOTAL_POSTS.toLocaleString()} posts across ${REF_COUNT.toLocaleString()} refs via ${CONCURRENCY} workers...`);

  let totalWritten = 0;
  let lastLog = Date.now();
  const onProgress = (n: number) => {
    totalWritten += n;
    const now = Date.now();
    if (now - lastLog > 2000) {
      const rate = totalWritten / ((now - t0) / 1000);
      const pct  = ((totalWritten / TOTAL_POSTS) * 100).toFixed(1);
      console.log(`  ${totalWritten.toLocaleString()} / ${TOTAL_POSTS.toLocaleString()} (${pct}%, ${rate.toFixed(0)} rows/s)`);
      lastLog = now;
    }
  };

  const refsPerWorker = Math.ceil(REF_COUNT / CONCURRENCY);
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async (_, w) => {
      const db = await connect();
      try {
        await seedSlice(
          db,
          {
            refStart: w * refsPerWorker,
            refEnd:   Math.min(REF_COUNT, (w + 1) * refsPerWorker),
            counts,
          },
          userIds,
          userRefIds,
          onProgress,
        );
      } finally {
        await db.close();
      }
    }),
  );

  const elapsed = (Date.now() - t0) / 1000;
  console.log(`\nDone. ${totalWritten.toLocaleString()} posts in ${elapsed.toFixed(1)}s (${(totalWritten / elapsed).toFixed(0)} rows/s)`);
}

main().catch(err => { console.error(err); process.exit(1); });
