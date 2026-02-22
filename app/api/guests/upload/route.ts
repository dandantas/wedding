import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface GuestRow {
  name: string;
  email: string;
  phone: string;
  maxCompanions: number;
}

function parseCsv(content: string): GuestRow[] {
  const [headerLine, ...dataLines] = content
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!headerLine) return [];

  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());

  const nameIdx = headers.indexOf("name");
  if (nameIdx === -1) {
    throw new Error("CSV must have a 'name' column");
  }

  const emailIdx = headers.indexOf("email");
  const phoneIdx = headers.indexOf("phone");
  const companionsIdx = headers.indexOf("maxcompanions");

  return dataLines.map((line, lineNum) => {
    const values = line.split(",").map((v) => v.trim());
    const name = values[nameIdx] ?? "";

    if (!name) {
      throw new Error(`Row ${lineNum + 2}: name is required`);
    }

    return {
      name,
      email: emailIdx >= 0 ? (values[emailIdx] ?? "") : "",
      phone: phoneIdx >= 0 ? (values[phoneIdx] ?? "") : "",
      maxCompanions:
        companionsIdx >= 0
          ? Number.parseInt(values[companionsIdx] ?? "0", 10) || 0
          : 0,
    };
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No CSV file provided. Send a 'file' field." },
        { status: 400 },
      );
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a .csv" },
        { status: 400 },
      );
    }

    const content = await file.text();
    let guests: GuestRow[];

    try {
      guests = parseCsv(content);
    } catch (parseError) {
      const message =
        parseError instanceof Error ? parseError.message : "Invalid CSV format";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (guests.length === 0) {
      return NextResponse.json(
        { error: "CSV contains no data rows" },
        { status: 400 },
      );
    }

    let created = 0;
    let updated = 0;

    for (const guest of guests) {
      if (guest.email) {
        const existing = await prisma.guest.findUnique({
          where: { email: guest.email },
        });

        await prisma.guest.upsert({
          where: { email: guest.email },
          update: {
            name: guest.name,
            phone: guest.phone || null,
            maxCompanions: guest.maxCompanions,
          },
          create: {
            name: guest.name,
            email: guest.email,
            phone: guest.phone || null,
            maxCompanions: guest.maxCompanions,
          },
        });

        if (existing) {
          updated++;
        } else {
          created++;
        }
      } else {
        await prisma.guest.create({
          data: {
            name: guest.name,
            phone: guest.phone || null,
            maxCompanions: guest.maxCompanions,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      total: guests.length,
      created,
      updated,
    });
  } catch (error) {
    console.error("Guest CSV upload error:", error);
    return NextResponse.json(
      { error: "Failed to process CSV upload" },
      { status: 500 },
    );
  }
}
