import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface GuestRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  maxCompanions: number;
}

function parseCsv(filePath: string): GuestRow[] {
  const content = readFileSync(filePath, "utf-8");
  const [headerLine, ...dataLines] = content
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const headers = headerLine.split(",").map((h) => h.trim());

  return dataLines.map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = values[i] ?? "";
    }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      maxCompanions: Number.parseInt(row.maxCompanions, 10) || 0,
    };
  });
}

async function main() {
  const csvPath = resolve(__dirname, "guests.csv");
  const guests = parseCsv(csvPath);

  console.log(`Found ${guests.length} guests in CSV. Seeding...`);

  let created = 0;
  let updated = 0;

  for (const guest of guests) {
    const existing = await prisma.guest.findUnique({
      where: { id: guest.id },
    });

    await prisma.guest.upsert({
      where: { id: guest.id },
      update: {
        name: guest.name,
        email: guest.email || undefined,
        phone: guest.phone || undefined,
        maxCompanions: guest.maxCompanions,
      },
      create: {
        id: guest.id,
        name: guest.name,
        email: guest.email || undefined,
        phone: guest.phone || undefined,
        maxCompanions: guest.maxCompanions,
      },
    });

    if (existing) {
      updated++;
    } else {
      created++;
    }

    console.log(`  ✓ ${guest.name}`);
  }

  console.log(`Done. Created: ${created}, Updated: ${updated}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
