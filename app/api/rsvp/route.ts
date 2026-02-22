import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RsvpPayload {
  guestId: string;
  attending: boolean;
  companionCount?: number;
  message?: string;
}

function validatePayload(
  body: unknown,
): { valid: true; data: RsvpPayload } | { valid: false; error: string } {
  const data = body as Record<string, unknown>;

  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  if (!data.guestId || typeof data.guestId !== "string") {
    return { valid: false, error: "Guest ID is required" };
  }

  if (typeof data.attending !== "boolean") {
    return { valid: false, error: "Attending status is required" };
  }

  const companionCount = Number(data.companionCount) || 0;
  if (companionCount < 0) {
    return { valid: false, error: "Companion count cannot be negative" };
  }

  return {
    valid: true,
    data: {
      guestId: data.guestId,
      attending: data.attending,
      companionCount: data.attending ? companionCount : 0,
      message:
        typeof data.message === "string"
          ? data.message.trim() || undefined
          : undefined,
    },
  };
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const result = validatePayload(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { data } = result;

    const guest = await prisma.guest.findUnique({
      where: { id: data.guestId },
      select: { id: true, maxCompanions: true },
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    if ((data.companionCount ?? 0) > guest.maxCompanions) {
      return NextResponse.json(
        {
          error: `Companion count exceeds allowed maximum of ${guest.maxCompanions}`,
        },
        { status: 400 },
      );
    }

    const rsvp = await prisma.rsvp.upsert({
      where: { guestId: data.guestId },
      update: {
        attending: data.attending,
        companionCount: data.companionCount ?? 0,
        message: data.message,
      },
      create: {
        guestId: data.guestId,
        attending: data.attending,
        companionCount: data.companionCount ?? 0,
        message: data.message,
      },
    });

    return NextResponse.json(
      { success: true, id: rsvp.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("RSVP submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit RSVP. Please try again." },
      { status: 500 },
    );
  }
}
