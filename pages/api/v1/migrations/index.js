import migrationsRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  try {
    const defaultMigrationsOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
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
