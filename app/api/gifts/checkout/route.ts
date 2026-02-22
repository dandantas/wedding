import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { abacatepay } from "@/lib/abacatepay";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const MIN_AMOUNT_CENTS = 100;

interface CheckoutPayload {
  giftId: string;
  amount: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestTaxId: string;
  message?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePayload(
  body: unknown
): { valid: true; data: CheckoutPayload } | { valid: false; error: string } {
  const data = body as Record<string, unknown>;

  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  if (!data.giftId || typeof data.giftId !== "string") {
    return { valid: false, error: "Gift ID is required" };
  }

  const amount = Number(data.amount);
  if (!amount || amount < MIN_AMOUNT_CENTS) {
    return { valid: false, error: `Minimum amount is R$${(MIN_AMOUNT_CENTS / 100).toFixed(2)}` };
  }

  if (!data.guestName || typeof data.guestName !== "string" || data.guestName.trim() === "") {
    return { valid: false, error: "Name is required" };
  }

  if (!data.guestEmail || typeof data.guestEmail !== "string" || !validateEmail(data.guestEmail)) {
    return { valid: false, error: "A valid email is required" };
  }

  if (!data.guestTaxId || typeof data.guestTaxId !== "string" || data.guestTaxId.trim() === "") {
    return { valid: false, error: "CPF/CNPJ is required" };
  }

  return {
    valid: true,
    data: {
      giftId: data.giftId,
      amount,
      guestName: (data.guestName as string).trim(),
      guestEmail: (data.guestEmail as string).trim().toLowerCase(),
      guestPhone: typeof data.guestPhone === "string" ? data.guestPhone.trim() || undefined : undefined,
      guestTaxId: (data.guestTaxId as string).trim(),
      message: typeof data.message === "string" ? data.message.trim() || undefined : undefined,
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

    const gift = await prisma.gift.findUnique({
      where: { id: data.giftId, active: true },
    });

    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    const giftPayment = await prisma.giftPayment.create({
      data: {
        giftId: gift.id,
        amount: data.amount,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        guestTaxId: data.guestTaxId,
        message: data.message,
      },
    });

    const billing = await abacatepay.billing.create({
      frequency: "ONE_TIME",
      methods: ["PIX", "CARD"],
      products: [
        {
          externalId: gift.id,
          name: gift.name,
          quantity: 1,
          price: data.amount,
        },
      ],
      returnUrl: `${APP_URL}/#gifts`,
      completionUrl: `${APP_URL}/?payment=success#gifts`,
      customer: {
        name: data.guestName,
        email: data.guestEmail,
        cellphone: data.guestPhone || "",
        taxId: data.guestTaxId,
      },
    });

    const billingData = billing?.data;

    await prisma.giftPayment.update({
      where: { id: giftPayment.id },
      data: {
        billingId: billingData?.id,
        billingUrl: billingData?.url,
      },
    });

    return NextResponse.json({ paymentUrl: billingData?.url });
  } catch (error) {
    console.error("Gift checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create payment. Please try again." },
      { status: 500 }
    );
  }
}
