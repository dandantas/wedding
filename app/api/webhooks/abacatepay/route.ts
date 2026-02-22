import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET;

const ABACATEPAY_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

function verifySignature(rawBody: string, signatureFromHeader: string): boolean {
  const bodyBuffer = Buffer.from(rawBody, "utf8");

  const expectedSig = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(bodyBuffer)
    .digest("base64");

  const expectedBuffer = Buffer.from(expectedSig);
  const receivedBuffer = Buffer.from(signatureFromHeader);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

interface WebhookBillingPayload {
  id: string;
  event: string;
  devMode: boolean;
  data: {
    payment: {
      amount: number;
      fee: number;
      method: string;
    };
    billing?: {
      id: string;
      amount: number;
      status: string;
      paidAmount: number;
      products: Array<{ externalId: string; id: string; quantity: number }>;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = request.nextUrl.searchParams.get("webhookSecret");

    if (!WEBHOOK_SECRET || webhookSecret !== WEBHOOK_SECRET) {
      console.error("Webhook secret mismatch");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await request.text();

    const signature = request.headers.get("x-webhook-signature");
    if (signature) {
      const isValid = verifySignature(rawBody, signature);
      if (!isValid) {
        console.error("Webhook HMAC signature verification failed");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload: WebhookBillingPayload = JSON.parse(rawBody);

    if (payload.event === "billing.paid" && payload.data.billing) {
      const billingId = payload.data.billing.id;
      const paymentMethod = payload.data.payment.method;

      const giftPayment = await prisma.giftPayment.findUnique({
        where: { billingId },
      });

      if (giftPayment && giftPayment.status !== "PAID") {
        await prisma.giftPayment.update({
          where: { billingId },
          data: {
            status: "PAID",
            paymentMethod,
            paidAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
