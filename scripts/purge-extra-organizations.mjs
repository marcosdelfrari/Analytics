import { config } from "dotenv";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../lib/generated/prisma/client.ts";

function pgConnectionString(connectionString) {
  if (!connectionString.includes("sslmode=")) return connectionString;
  return connectionString.replace(
    /([?&])sslmode=(require|prefer|verify-ca)(?=&|$)/,
    "$1sslmode=verify-full",
  );
}

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const KEEP_NAMES = ["Lótus", "Varte Company"];

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL não definida.");
  process.exit(1);
}

const pool = new Pool({ connectionString: pgConnectionString(raw) });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const all = await prisma.organization.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          companies: true,
          accessGrants: true,
          leadForms: true,
          leadSubmissions: true,
        },
      },
    },
  });

  console.log("Organizações atuais:");
  for (const org of all) {
    console.log(
      `  - ${JSON.stringify(org.name)} (${org.id}) · ${org._count.companies} empresas · ${org._count.accessGrants} grants`,
    );
  }

  const toDelete = all.filter((org) => !KEEP_NAMES.includes(org.name));
  const kept = all.filter((org) => KEEP_NAMES.includes(org.name));

  for (const name of KEEP_NAMES) {
    if (!kept.some((org) => org.name === name)) {
      console.warn(`AVISO: organização ${JSON.stringify(name)} não encontrada.`);
    }
  }

  if (toDelete.length === 0) {
    console.log("\nNada a remover.");
    process.exit(0);
  }

  console.log(`\nRemovendo ${toDelete.length} organização(ões):`);
  for (const org of toDelete) {
    console.log(`  × ${org.name}`);
  }

  const result = await prisma.organization.deleteMany({
    where: {
      name: { notIn: KEEP_NAMES },
    },
  });

  console.log(`\nConcluído: ${result.count} organização(ões) apagada(s).`);

  const remaining = await prisma.organization.findMany({
    orderBy: { name: "asc" },
    select: { name: true, id: true },
  });
  console.log("\nRestantes:");
  for (const org of remaining) {
    console.log(`  - ${org.name}`);
  }
} finally {
  await prisma.$disconnect();
  await pool.end();
}
