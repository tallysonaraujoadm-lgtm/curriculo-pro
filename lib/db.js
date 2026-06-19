import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL não foi configurada.");
}

function normalizeConnectionString(connectionString) {
  if (!connectionString) return connectionString;

  const url = new URL(connectionString);
  // O node-postgres sobrescreve a opção `ssl` quando `sslmode` está na URI.
  // A conexão continua criptografada pela configuração explícita abaixo.
  url.searchParams.delete("sslmode");
  url.searchParams.delete("uselibpqcompat");
  return url.toString();
}

export const pool = new Pool({
  connectionString: normalizeConnectionString(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000
});
