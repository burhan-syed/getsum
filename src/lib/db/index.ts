import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
  throw new Error("Missing DB URI");
}

// for query purposes
const queryClient = postgres(DB_URI);
const db = drizzle(queryClient);

export default db;