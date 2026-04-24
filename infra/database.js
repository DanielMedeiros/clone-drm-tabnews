import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load remote credentials from .env.development and override any existing env vars
dotenv.config({
  path: path.resolve(__dirname, "../.env.local"),
  override: true,
});

async function query(queryObject) {
  const isLocal = /^(localhost|127\.0\.0\.1)$/.test(
    String(process.env.POSTGRES_HOST || ""),
  );

  const clientConfig = {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  };

  // If we're connecting to a remote host (e.g. Aiven), enable SSL
  if (!isLocal) {
    clientConfig.ssl = { rejectUnauthorized: false };
  }

  const client = new Client(clientConfig);

  console.log("Credenciais :>> ", {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

  try {
    await client.connect();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    client.end();
  }
}
export default {
  query: query,
};
