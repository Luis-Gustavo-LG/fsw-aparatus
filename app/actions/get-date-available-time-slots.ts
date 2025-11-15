"use server";

import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { endOfDay, format, startOfDay } from "date-fns";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { returnValidationErrors } from "next-safe-action";

const inputSchema = z.object({
    barberShopId: z.string(),
    date: z.date(),
})

const generateTimeSlots = (): string[] => {
    const slots: string[] = []
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`)
      }
    }
    return slots
  }

export const getDateAvailableTimeSlots = actionClient
.inputSchema(inputSchema)
.action(async ({ parsedInput: { barberShopId, date } }) => {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if(!session?.user){
      returnValidationErrors(inputSchema, {
        _errors: ["Não autorizado"]
      })
    }
    const bookings = await prisma.booking.findMany({
        where: {
            barberShopId,
            date: {
                gte: startOfDay(date),
                lt: endOfDay(date)
            }
        }
    })
    const occupiedSlots = bookings.map(booking => 
        format(booking.date, "HH:mm"))
        const availableTimeSlots = generateTimeSlots().filter(slot => !occupiedSlots.includes(slot));
        return availableTimeSlots;
})