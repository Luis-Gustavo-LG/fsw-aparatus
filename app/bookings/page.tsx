import { prisma } from "@/lib/prisma"
import Header from "../_components/header"
import { startOfToday } from "date-fns"
import BookingItem from "../_components/booking-item"
import Footer from "../_components/footer"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Spinner } from "../_components/ui/spinner"

const Bookings = async () => {

    const session = await auth.api.getSession({
        headers: await headers()
      })

    const confirmedBookings = await prisma.booking.findMany({
        where: {
            date: {
                gte: startOfToday()
            },
            cancelled: false,
            userId: session?.user.id
        },
        include: {
            service: true,
            barbershop: true
        }
    })

    const inactiveBookings = await prisma.booking.findMany({
        where: {
            date: {
                lt: startOfToday()
            },
            cancelled: true,
            userId: session?.user.id
        },
        include: {
            service: true,
            barbershop: true
        }
    })

    if(!session){
        return redirect("/")
    }

    return (
        <main className="min-h-screen flex flex-col">
            <Header/>
            {confirmedBookings.length === 0 && inactiveBookings.length === 0 ? (
  <div className="flex-1 flex items-center justify-center">
    <p className="text-muted-foreground text-xl">Você não possui agendamentos.</p>
  </div>
) : (
  <div className="flex flex-col px-5 space-y-7">
    <p className="font-semibold text-2xl">Agendamentos</p>

    {/* Confirmados */}
    <div className="flex flex-col space-y-3">
      <p className="text-muted-foreground text-2xs">Confirmados</p>
      {confirmedBookings.map((booking) => (
        <BookingItem
          key={booking.id}
          serviceName={booking.service.name}
          barbershopName={booking.barbershop.name}
          barbershopImageUrl={booking.barbershop.imageUrl}
          date={booking.date}
          status="confirmed"
        />
      ))}
    </div>

    {/* Cancelados */}
    <div className="flex flex-col space-y-3">
      <p className="text-muted-foreground text-2xs">Cancelados</p>
      {inactiveBookings.map((booking) => (
        <BookingItem
          key={booking.id}
          serviceName={booking.service.name}
          barbershopName={booking.barbershop.name}
          barbershopImageUrl={booking.barbershop.imageUrl}
          date={booking.date}
          status="inactive"
        />
      ))}
    </div>
  </div>
)}

            
            <Footer/>
        </main>
    )
}

export default Bookings