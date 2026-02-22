import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ guests });
  } catch (error) {
    console.error("Failed to fetch guest list:", error);
    return NextResponse.json(
      { error: "Failed to load guest list" },
      { status: 500 },
    );
  }
}
