import { config } from "dotenv";
import { resolve } from "node:path";
import pg from "pg";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL não definida.");
  process.exit(1);
}

const connectionString = raw.includes("sslmode=")
  ? raw.replace(
      /([?&])sslmode=(require|prefer|verify-ca)(?=&|$)/,
      "$1sslmode=verify-full",
    )
  : raw;

const pool = new pg.Pool({ connectionString });

const orgs = await pool.query(
  `SELECT o.name, o.id,
          (SELECT COUNT(*)::int FROM dbo.cad_empresa c WHERE c.organization_id = o.id) AS companies,
          (SELECT COUNT(*)::int FROM dbo.cad_acesso g WHERE g.organization_id = o.id) AS grants
   FROM dbo.cad_organizacao o
   ORDER BY o.name`,
);

console.log("Organizações:");
for (const row of orgs.rows) {
  console.log(
    `  - ${row.name} · ${row.companies} empresa(s) · ${row.grants} grant(s)`,
  );
}

const orphanGrants = await pool.query(
  `SELECT COUNT(*)::int AS n FROM dbo.cad_acesso g
   WHERE NOT EXISTS (SELECT 1 FROM dbo.cad_organizacao o WHERE o.id = g.organization_id)`,
);

const usersNoGrant = await pool.query(
  `SELECT COUNT(*)::int AS n FROM dbo.cad_usuario u
   WHERE NOT EXISTS (SELECT 1 FROM dbo.cad_acesso g WHERE lower(g.email) = lower(u.email))`,
);

const orphanUsers = await pool.query(
  `SELECT u.email, u.name FROM dbo.cad_usuario u
   WHERE NOT EXISTS (SELECT 1 FROM dbo.cad_acesso g WHERE lower(g.email) = lower(u.email))
   ORDER BY u.email`,
);

console.log(`\nUsuários sem nenhum grant: ${usersNoGrant.rows[0].n}`);
if (orphanUsers.rows.length > 0) {
  console.log("  (contas órfãs — não vinculadas a Lótus nem Varte):");
  for (const row of orphanUsers.rows) {
    console.log(`    · ${row.email} (${row.name})`);
  }
}

await pool.end();
