import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ guestId: string }> },
) {
  try {
    const { guestId } = await params;

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        name: true,
        maxCompanions: true,
        rsvp: {
          select: {
            attending: true,
            companionCount: true,
            message: true,
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json({
      guest: {
        id: guest.id,
        name: guest.name,
        maxCompanions: guest.maxCompanions,
      },
      rsvp: guest.rsvp,
    });
  } catch (error) {
    console.error("Failed to fetch guest RSVP:", error);
    return NextResponse.json(
      { error: "Failed to load RSVP data" },
      { status: 500 },
    );
  }
}
