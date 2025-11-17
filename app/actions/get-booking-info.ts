"use server";

import { actionClient } from "@/lib/action-client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { returnValidationErrors } from "next-safe-action"
import { headers } from "next/headers"
import z from "zod"

const inputSchema = z.object({
    bookingId: z.uuid()
})

export const getBookingInfo = actionClient
    .inputSchema(inputSchema)
    .action(async({ parsedInput: { bookingId } }) => {

        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session) {
            return returnValidationErrors(inputSchema, { _errors: ["Não autorizado"] });
        }

    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        },
        include: {
            barbershop: true,
            service: true
        }
    })

    if (!booking) {
        return returnValidationErrors(inputSchema, { _errors: ["Agendamento não encontrado"] })
      }
  
      if (booking.userId !== session.user.id) {
        return returnValidationErrors(inputSchema, { _errors: ["Acesso negado"] })
      }
  
      return {
        id: booking.id,
        date: booking.date,
        cancelled: booking.cancelled,
        service: {
          id: booking.service.id,
          name: booking.service.name,
          priceInCents: booking.service.priceInCents
        },
        barbershop: {
          id: booking.barbershop.id,
          name: booking.barbershop.name,
          imageUrl: booking.barbershop.imageUrl,
          address: booking.barbershop.address,
          phones: booking.barbershop.phones
        }
      }
})