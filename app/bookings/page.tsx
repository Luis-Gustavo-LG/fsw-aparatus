import { prisma } from "@/lib/prisma"
import Header from "../_components/header"
import { startOfToday } from "date-fns"
import BookingItem from "../_components/booking-item"
import Footer from "../_components/footer"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const Bookings = async () => {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return redirect("/")
  }

  const confirmedBookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: startOfToday()
      },
      cancelled: false,
      userId: session.user.id
    },
    include: {
      service: true,
      barbershop: true
    }
  })

  const inactiveBookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
      OR: [
        {
          date: {
            lt: startOfToday(),
          },
        },
        {
          cancelled: true,
        },
      ],
    },
    include: {
      service: true,
      barbershop: true,
    },
  });

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {confirmedBookings.length === 0 && inactiveBookings.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-xl">
            Você não possui agendamentos.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-5 space-y-7">
          <p className="font-semibold text-2xl">Agendamentos</p>

          {/* Confirmados */}
          <div className="flex flex-col space-y-3">
            <p className="text-muted-foreground text-2xs">Confirmados</p>

            {confirmedBookings.map((booking) => (
              <BookingItem
                key={booking.id}
                bookingId={booking.id}
                serviceName={booking.service.name}
                barbershopName={booking.barbershop.name}
                barbershopImageUrl={booking.barbershop.imageUrl}
                date={booking.date}
                status="confirmed"
              />
            ))}
          </div>

          {/* Cancelados */}
          {inactiveBookings.length > 0 && (
            <div className="flex flex-col space-y-3">

              <p className="text-muted-foreground text-2xs">Cancelados</p>

              {inactiveBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  bookingId={booking.id}
                  serviceName={booking.service.name}
                  barbershopName={booking.barbershop.name}
                  barbershopImageUrl={booking.barbershop.imageUrl}
                  date={booking.date}
                  status="inactive"
                />
              ))}

            </div>
          )}

        </div>
      )}

      <Footer />
    </main>
  )
}

export default Bookings
