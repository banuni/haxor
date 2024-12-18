import { drizzle } from "drizzle-orm/libsql";


export const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return drizzle(process.env.DATABASE_URL);
};
