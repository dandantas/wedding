import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const gifts = await prisma.gift.findMany({
      where: { active: true },
      orderBy: { suggestedPrice: "asc" },
      select: {
        id: true,
        name: true,
        nameEn: true,
        description: true,
        descriptionEn: true,
        imageUrl: true,
        suggestedPrice: true,
      },
    });

    return NextResponse.json({ gifts });
  } catch (error) {
    console.error("Failed to fetch gifts:", error);
    return NextResponse.json(
      { error: "Failed to load gifts" },
      { status: 500 }
    );
  }
}
