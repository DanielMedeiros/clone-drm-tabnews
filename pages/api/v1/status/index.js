import database from "infra/database.js";

export default async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();
    const databaseVersion = await database.query("SHOW server_version;");
    const dataBaseVersionValue = databaseVersion.rows[0].server_version;
    const databaseMaxConnections = await database.query(
      "SHOW max_connections;",
    );
    const databaseMaxConnectionsValue =
      databaseMaxConnections.rows[0].max_connections;

    const databaseName = process.env.POSTGRES_DB;

    const databaseOpenConnections = await database.query({
      text: "SELECT count(*)::integer FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });
    const databaseOpenConnectionsValue = databaseOpenConnections;

    return response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: dataBaseVersionValue,
          max_connections: parseInt(databaseMaxConnectionsValue),
          open_connections: databaseOpenConnectionsValue.rows.length,
        },
      },
    });
  } catch (error) {
    console.error("Status check error:", error);
    return response.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
