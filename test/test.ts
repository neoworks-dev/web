import { RecordId, Surreal, Uuid } from "surrealdb";

const URL      = process.env.SURREAL_URL  ?? 'ws://localhost:8000/rpc';
const USERNAME = process.env.SURREAL_USER ?? 'root';
const PASSWORD = process.env.SURREAL_PASS ?? 'root';
const NS       = process.env.SURREAL_NS   ?? 'test';
const DBNAME   = process.env.SURREAL_DB   ?? 'test3';

async function connect(): Promise<Surreal> {
  const db = new Surreal();
  await db.connect(URL);
  await db.signin({ username: USERNAME, password: PASSWORD });
  await db.use({ namespace: NS, database: DBNAME });
  return db;
}

async function main() {
  const db = await connect();

  await db.query("DELETE FROM contact");

  const entity_id = Uuid.v7();

  const [{id }] =  await db.insert({
    id: new RecordId('contact', 'john-doe'),
    name: 'John Doe',
    entity_id,
    parents: []
  })


  await db.insert({
    id: new RecordId('contact', 'jane-doe'),
    name: "Jane Doe",
    entity_id,
    parents: [id]
    })

  const john = await db.query("SELECT * FROM contact WHERE entity_id = $entity_id", {
    entity_id
  })
  console.log(john)
}

main()
