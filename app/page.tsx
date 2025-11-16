import Image from "next/image";
import Header from "./_components/header";
import SearchInput from "./_components/search-input";
import banner from '../public/banner.png'
import BookingItem from "./_components/booking-item";
import { prisma } from "@/lib/prisma";
import BarbershopItem from "./_components/barbershop-item";
import Footer from "./_components/footer";
import { PageContainer, PageSection, PageSectionScroller, PageSectionTitle } from "./_components/page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const Home = async () => {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  const recommendedBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "asc"
    }
  });

  const popularBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "desc"
    }
  })

  const booking = await prisma.booking.findFirst({
    include: {
      service: true,
      barbershop: true
    },
    where: {
      cancelled: false,
      userId: session?.user.id
    }
  })

  return (
    <main>
      <Header />
      <PageContainer>
        <SearchInput />
        <Image 
          src={banner}
          alt={"Agende agora!"}
          sizes="100vw"
          className="w-full h-auto"
        />

        <PageSection> 
        {session?.user && booking && (
          <>
          <PageSectionTitle>Agendamentos</PageSectionTitle>
          <BookingItem
          bookingId={booking?.id}
          serviceName={booking?.service.name}
          barbershopName={booking?.barbershop.name}
          barbershopImageUrl={booking?.barbershop.imageUrl}
          date={booking?.date}
          status="confirmed"
        />
          </>
        )}
        
        </PageSection>

        <PageSection>
        <PageSectionTitle>Recomendados</PageSectionTitle>
        <PageSectionScroller>
        {recommendedBarbershops.map((barbershop) => (
          <BarbershopItem key={barbershop.id} barbershop={barbershop}/>
        ))}
        </PageSectionScroller>
        </PageSection>

        <PageSection>
        <PageSectionTitle>Populares</PageSectionTitle>
        <PageSectionScroller>
        {popularBarbershops.map((barbershop) => (
          <BarbershopItem key={barbershop.id} barbershop={barbershop}/>
        ))}
        </PageSectionScroller>
        </PageSection>
        </PageContainer>
      <Footer/>
    </main>
  )
}

export default Home;