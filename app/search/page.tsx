import { prisma } from "@/lib/prisma"
import BarbershopItem from "../_components/barbershop-item"
import { PageContainer, PageSection, PageSectionTitle } from "../_components/page"
import Link from "next/link"
import Header from "../_components/header"
import Footer from "../_components/footer"

interface SearchPageProps {
  searchParams: {
    query?: string
    page?: string
    limit?: string
  }
}

export default async function BarbershopsPage(
    props: { searchParams: Promise<SearchPageProps["searchParams"]> }) {

  const searchParams = await props.searchParams
  const search = searchParams.query ?? ""
  const page = Number(searchParams.page ?? 1)
  const limit = Number(searchParams.limit ?? 10)

  const skip = (page - 1) * limit

  const barbershops = await prisma.barbershop.findMany({
    where: {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          services: {
            some: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    },
    include: { services: true },
    orderBy: { name: "asc" },
    skip,
    take: limit,
  })

  const totalResults = await prisma.barbershop.count({
    where: {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          services: {
            some: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    },
  })

  const totalPages = Math.ceil(totalResults / limit)

  return (
    <main>
    <Header/>
      <PageContainer>
        <PageSection>
          <PageSectionTitle>
            Resultados para {`"${search}"`}.
          </PageSectionTitle>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {barbershops.length > 0 ? (
              barbershops.map((barbershop) => (
                <BarbershopItem key={barbershop.id} barbershop={barbershop} />
              ))
            ) : (
              <p className="text-muted-foreground">
                Nenhuma barbearia encontrada para {`"${search}"`}.
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              {page > 1 && (
                <Link
                  href={`/search?query=${search}&page=${page - 1}&limit=${limit}`}
                  className="px-4 py-2 rounded-lg bg-primary text-white"
                >
                  ← Anterior
                </Link>
              )}

              <span>Página {page} de {totalPages}</span>

              {page < totalPages && (
                <Link
                  href={`/search?query=${search}&page=${page + 1}&limit=${limit}`}
                  className="px-4 py-2 rounded-lg bg-primary text-white"
                >
                  Próxima →
                </Link>
              )}
            </div>
          )}
        </PageSection>
      </PageContainer>
      <Footer/>
    </main>
  )
}
