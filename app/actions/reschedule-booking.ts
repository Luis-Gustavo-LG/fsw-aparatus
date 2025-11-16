"use server";

import { actionClient } from "@/lib/action-client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { returnValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

const inputSchema = z.object({
    bookingId: z.uuid()
})

export const rescheduleBooking = actionClient
    .inputSchema(inputSchema)
    .action(async( { parsedInput: { bookingId }} ) => {

        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session) {
            return 
            returnValidationErrors(inputSchema, { _errors: ["Não autorizado"] });
        }

    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    })

    if(!booking){
        return
        returnValidationErrors(inputSchema, {_errors: ["Agendamento não encontrado"]})
    }

    if(booking.userId !== session?.user.id){
        return
        returnValidationErrors(inputSchema, {_errors: ["Agendamento não pertence ao usuário logado"]})
    }

    if(!booking.cancelled){
        return
        returnValidationErrors(inputSchema, {_errors: ["Agendamento já está remarcado"]})
    }

    await prisma.booking.update({
        where: {
            id: bookingId
        },
        data: {
            cancelled: false,
            cancelledAt: null
        }
    })

    revalidatePath("/bookings")
    revalidatePath("/")

    return { success: true }
})