"use server";

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/action-client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const inputSchema = z.object({
  bookingId: z.string().uuid(),
});

export const cancelBooking = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { bookingId } }) => {

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is missing");
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (!booking.paymentIntentId) {
      throw new Error("This booking has no payment intent. Cannot refund.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    });

    await stripe.refunds.create({
      payment_intent: booking.paymentIntentId,
    });

    revalidatePath("/bookings")
    revalidatePath("/")

    return { success: true };
  });
