const { exec } = require("node:child_process");

function checkPostgres() {
  exec('docker exec postgres-dev pg_isready', handleReturn)

  function handleReturn(error, stdout, stderr) {
    if (stdout.search('accepting connections') === -1) {
      console.log("❌ Não está aceitando conexões ainda...");
      checkPostgres()
      return;
    }

    console.log("✅ Banco de dados postgress conectado com sucesso!");
  }
}

console.log("🔴 Aguardando o banco de dados postgress...");
checkPostgres()