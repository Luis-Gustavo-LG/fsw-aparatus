import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.error();
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.error();

  const body = Buffer.from(await request.arrayBuffer());
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.error();
  }

  // ======== IGNORAR EVENTOS QUE NÃO IMPORTAM ========
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "charge.refunded" &&
    event.type !== "charge.refund.updated"
  ) {
    return NextResponse.json({ ignored: true });
  }

  // ============================================================
  //   CHECKOUT SESSION COMPLETED
  // ============================================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    const metadata = session.metadata;

    if (metadata?.type === "reschedule") {
      await prisma.booking.update({
        where: { id: metadata.bookingId },
        data: {
          cancelled: false,
          cancelledAt: null,
          paymentIntentId,
        },
      });
    } else {
      const { date, serviceId, barberShopId, userId } = metadata ?? {};

      await prisma.booking.create({
        data: {
          serviceId,
          barberShopId,
          userId,
          date: new Date(date),
          paymentIntentId,
        },
      });
    }
  }

  // ============================================================
  //   CANCELAMENTO — REFUND
  // ============================================================
  if (event.type === "charge.refunded" || event.type === "charge.refund.updated") {
    const charge = event.data.object;

    const paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (paymentIntentId) {
      await prisma.booking.updateMany({
        where: { paymentIntentId },
        data: {
          cancelled: true,
          cancelledAt: new Date(),
        },
      });
    }
  }

  return NextResponse.json({ received: true });
};
