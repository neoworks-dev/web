import { Surreal, RecordId, Uuid } from "surrealdb";
import { faker} from "@faker-js/faker"

// ── Config ────────────────────────────────────────────────────────────────────
const cfg = {
  url:          "ws://localhost:8000/rpc",
  ns:           "test",
  db:           "bench",

  shortEntities: 100_000,   // × shortDepth contact records
  shortDepth:    3,
  longEntities:  2_000,     // × longDepth contact records
  longDepth:     200,

  batchSize:     1_000,     // records per INSERT
  entityChunk:   5_000,     // entities built in memory at once (controls RAM)
  readSample:    500,       // entities sampled per read benchmark
};
// Total contacts ≈ (shortEntities × shortDepth) + (longEntities × longDepth)
//                = 1,500,000 + 1,000,000 = ~2,500,000

// ── Helpers ───────────────────────────────────────────────────────────────────
function now() { return performance.now(); }

function report(label: string, ms: number, count?: number) {
  const rate = count ? `  →  ${(count / ms * 1_000).toFixed(0)}/s` : "";
  console.log(`  ${label.padEnd(42)} ${ms.toFixed(0).padStart(7)}ms${rate}`);
}

function progress(count: number, total: number) {
  process.stdout.write(`  ${count.toLocaleString()} / ${total.toLocaleString()} (${(count / total * 100).toFixed(1)}%)\r`);
}

async function batchGenerateContacts(db: Surreal, count: number, depth: number) { 
  const contacts = []
  const users = []
  const heads = []
  for (let i = 0; i < count; i++) {
    const userId = new RecordId("user", Uuid.v4())
    users.push({
      id: userId,
      username: faker.internet.username(),
    })


    const uuid = Uuid.v7()
    contacts.push({
      id: new RecordId("contacts", Uuid.v4()),
      created_at: new Date(),
      created_by: "benchmark",
      email: faker.internet.email(),
      entity_id: uuid,
      name: faker.person.fullName(),
      parents: [],
      phone: faker.phone.number(),
      tombstone: false,
      user: userId
    })

    let lastUpdate: RecordId = contacts[contacts.length - 1].id
    for (let j = 0; j < depth; j++) {
      contacts.push({
        id: new RecordId("contacts", Uuid.v4()),
      created_at: new Date(),
      created_by: "benchmark",
      email: faker.internet.email(),
      entity_id: uuid,
      name: faker.person.fullName(),
      parents: [lastUpdate],
      phone: faker.phone.number(),
      tombstone: false,
      user: userId
    })
      lastUpdate = contacts[contacts.length - 1].id
    }
    heads.push({
      entity_id: uuid,
      head: lastUpdate,
      updated_at: new Date(),
    })
    if (count % 1000 === 0) {
      progress(i + 1, count)
    }
  }
  
  return { contacts, users, heads }
}

async function bulkInsert(db: Surreal, table: string, records: any[], batchSize: number) {
  for (let i = 0; i < records.length; i += batchSize) {
 await db.query("INSERT INTO $table $records", { table, records: records.slice(i, batchSize) })
    progress(i, records.length)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const db = new Surreal();
  await db.connect(cfg.url);
  await db.use({ namespace: cfg.ns, database: cfg.db });
  await db.signin({ username: "root", password: "root" });
  console.log("✓ connected");
  console.log(`  batch size: ${cfg.batchSize}  |  entity chunk: ${cfg.entityChunk}`);

  const { heads: shortEntityHeads, contacts: shortEntities, users: shortEntityUsers } = await batchGenerateContacts(db, cfg.shortEntities, cfg.shortDepth)
  const { heads: longEntityHeads, contacts: longEntities, users: longEntityUsers } = await batchGenerateContacts(db, cfg.longEntities, cfg.longDepth)

  console.log("Finished generating contacts, starting bulk insert...")

  await bulkInsert(db, "contacts", shortEntities, cfg.batchSize);
  await bulkInsert(db, "user", shortEntityUsers, cfg.batchSize);
  await bulkInsert(db, "contacts", longEntities, cfg.batchSize);
  await bulkInsert(db, "user", longEntityUsers, cfg.batchSize);
  await bulkInsert(db, "entity_heads", shortEntityHeads, cfg.batchSize);
  await bulkInsert(db, "entity_heads", longEntityHeads, cfg.batchSize);


  const t0 = now();

  // ── Totals ──
  const [[cRow]] = await db.query<[{ count: number }[]]>(
    `SELECT count() AS count FROM contacts GROUP ALL`,
  );
  const [[hRow]] = await db.query<[{ count: number }[]]>(
    `SELECT count() AS count FROM entity_heads GROUP ALL`,
  );

  console.log(`\n── Summary ──`);
  console.log(`  total contacts:     ${cRow?.count?.toLocaleString()}`);
  console.log(`  total entity_heads: ${hRow?.count?.toLocaleString()}`);
  console.log(`  wall time:          ${((now() - t0) / 1_000).toFixed(1)}s`);

  await db.close();
}

main().catch(console.error);
