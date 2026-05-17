import migrationsRunner from "node-pg-migrate";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import database from "infra/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  try {
    const migrationsDir = join(__dirname, "../../../../infra/migrations");
    const defaultMigrationsOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: migrationsDir,
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };
    if (request.method === "GET") {
      const migrations = await migrationsRunner({
        ...defaultMigrationsOptions,
        dryRun: true,
      });
      return response.status(200).json(migrations);
    }

    if (request.method === "POST") {
      const migrations = await migrationsRunner({
        ...defaultMigrationsOptions,
        dryRun: false,
      });

      if (migrations.length > 0) {
        return response.status(201).json(migrations);
      }
      return response.status(200).json(migrations);
    }

    return response.status(405).json({ message: "Method not allowed" });
  } finally {
    await dbClient.end();
  }
}
