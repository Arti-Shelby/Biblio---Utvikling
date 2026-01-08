import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.ATLAS_URI || "";
if (!uri) {
  throw new Error("Missing ATLAS_URI in environment variables.");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let _db = null;

export async function connectToMongo() {
  if (_db) return _db;

  await client.connect();
  await client.db("admin").command({ ping: 1 });

  const dbName = process.env.DB_NAME || "biblio";
  _db = client.db(dbName);

  console.log(`Connected to MongoDB (db: ${dbName})`);
  return _db;
}

export function getDb() {
  if (!_db) {
    throw new Error("Database not initialized. Call connectToMongo() first.");
  }
  return _db;
}
