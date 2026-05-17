import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env files if present (use project CWD)
// Only load in non-production environments
if (process.env.NODE_ENV !== "production") {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env.local"),
    override: false,
  });
  dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: false });
}

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return { ca: process.env.POSTGRES_CA, rejectUnauthorized: false };
  }
  return undefined;
}

const clientConfig = {
  host: process.env.POSTGRES_HOST || "localhost",
  port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "",
  database: process.env.POSTGRES_DB || "postgres",
  ssl: getSSLValues(),
};

async function query(queryText, params) {
  const client = new Client(clientConfig);
  try {
    await client.connect();
    const result = await client.query(queryText, params);
    return result;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    await client.end();
  }
}

async function getNewClient() {
  const clientConfig = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "",
    database: process.env.POSTGRES_DB || "postgres",
    ssl: getSSLValues(),
  };

  const client = new Client(clientConfig);
  await client.connect();
  return client;
}

export default { query, getNewClient };
