import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
  throw new Error("Missing DB URI");
}

const drizzleClientSingleton = () => {
  // for query purposes
  const queryClient = postgres(DB_URI!);
  const db = drizzle(queryClient);
  return db;
};

declare global {
  var drizzle: undefined | ReturnType<typeof drizzleClientSingleton>;
}

const db = globalThis.drizzle ?? drizzleClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") {
  globalThis.drizzle = db;
}
