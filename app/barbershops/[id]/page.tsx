import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/app/_components/ui/button"
import { Separator } from "@/app/_components/ui/separator"
import { ChevronLeft } from "lucide-react"
import ServiceItem from "@/app/_components/service-item"
import ContactPhoneItem from "@/app/_components/contact-phone-item"
import Footer from "@/app/_components/footer"
import { BarbershopSeparatorSpacing, BarbershopSectionTitle, BarbershopSectionSpacing, BarbershopSectionCentralizer } from "@/app/_components/page"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const BarbershopPage = async (props: PageProps<"/barbershops/[id]">) => {
    const { id } = await props.params

    const barbershop = await prisma.barbershop.findUnique({
        where: {
            id,
        },
        include: {
            services: true,
        }
    })

    if (!barbershop) {
        notFound()
    }

    return (
        <main className="min-h-screen">
            {/* Banner Header */}
            <div className="relative h-[297px] w-full">
                <Image
                    src={barbershop.imageUrl}
                    alt={barbershop.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute top-6 left-5 z-10">
                    <Link href="/">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-full"
                        >
                            <ChevronLeft className="size-5" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-background rounded-t-[24px] -mt-6 relative z-10">
                {/* Barbershop Info */}
                <div className="px-5 pt-6 pb-0">
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-1.5 items-start">
                            <p className="font-bold text-xl leading-normal text-foreground">
                                {barbershop.name}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 mt-1">
                            <div className="flex gap-2 items-center">
                                <p className="font-normal text-sm leading-[1.4] text-muted-foreground">
                                    {barbershop.address}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <BarbershopSeparatorSpacing>
                    <Separator />
                </BarbershopSeparatorSpacing>

                {/* About Section */}
                <BarbershopSectionSpacing>
                    <BarbershopSectionCentralizer>
                        <BarbershopSectionTitle>
                            SOBRE NÓS
                        </BarbershopSectionTitle>
                    </BarbershopSectionCentralizer>
                    <p className="font-normal text-sm leading-[1.4] text-foreground whitespace-pre-wrap">
                        {barbershop.description}
                    </p>
                </BarbershopSectionSpacing>

                <BarbershopSeparatorSpacing>
                    <Separator />
                </BarbershopSeparatorSpacing>

                {/* Services Section */}
                <BarbershopSectionSpacing>
                    <BarbershopSectionCentralizer>
                        <BarbershopSectionTitle>
                            SERVIÇOS
                        </BarbershopSectionTitle>
                    </BarbershopSectionCentralizer>
                    <div className="flex flex-col gap-3">
                        {barbershop.services.map((service) => (
                            <ServiceItem key={service.id} service={service} />
                        ))}
                    </div>
                </BarbershopSectionSpacing>

                <BarbershopSeparatorSpacing>
                    <Separator />
                </BarbershopSeparatorSpacing>

                {/* Contact Section */}
                <BarbershopSectionSpacing>
                    <BarbershopSectionCentralizer>
                        <BarbershopSectionTitle>
                            CONTATO
                        </BarbershopSectionTitle>
                    </BarbershopSectionCentralizer>
                    <div className="flex flex-col gap-3">
                        {barbershop.phones.map((phone, index) => (
                            <ContactPhoneItem key={index} phone={phone} />
                        ))}
                    </div>
                </BarbershopSectionSpacing>

                {/* Footer */}
                <div className="pt-[60px] pb-0 px-0">
                    <Footer />
                </div>
            </div>
        </main>
    )
}

export default BarbershopPage