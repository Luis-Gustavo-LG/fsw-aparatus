import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export const POST = async(request: Request) => {
    if(!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET){
        return NextResponse.error()
    }

    const signature = request.headers.get("stripe-signature")
    if(!signature){
        return NextResponse.error()
    }

    const text = await request.text()
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const events = stripe.webhooks.constructEvent(text, signature, process.env.STRIPE_WEBHOOK_SECRET)

    if(events.type == 'checkout.session.completed'){
        const session = events.data.object;
        const date = session.metadata?.date
        const serviceId = session.metadata?.serviceId
        const barberShopId = session.metadata?.barberShopId
        const userId = session.metadata?.userId
        if(!date || !serviceId || !barberShopId || !userId){
            return NextResponse.error()
        }
        await prisma.booking.create({
            data: {
                serviceId,
                date,
                barberShopId,
                userId
            }
        })
    }
    revalidatePath("/bookings")
    return NextResponse.json({ received: true })
}