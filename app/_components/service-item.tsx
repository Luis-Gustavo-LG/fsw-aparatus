"use client"

import Image from "next/image"
import { Button } from "./ui/button"
import { BarbershopService } from "../generated/prisma/client"

interface ServiceItemProps {
  service: BarbershopService
}

const formatPrice = (priceInCents: number) => {
  const price = priceInCents / 100
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

const ServiceItem = ({ service }: ServiceItemProps) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-3 flex gap-3 items-center w-full">
      <div className="relative rounded-[10px] shrink-0 size-[110px] overflow-hidden">
        <Image
          src={service.imageUrl}
          alt={service.name}
          fill
          className="rounded-[10px] object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col h-full items-start justify-between min-h-0 min-w-0">
        <div className="flex flex-col gap-1 text-sm leading-[1.4] w-full min-h-[67.5px]">
          <p className="font-bold text-sm text-card-foreground w-full">
            {service.name}
          </p>
          <p className="font-normal text-sm text-muted-foreground w-full">
            {service.description}
          </p>
        </div>
        <div className="flex items-center justify-between w-full mt-auto">
          <p className="font-bold text-sm leading-[1.4] text-card-foreground">
            {formatPrice(service.priceInCents)}
          </p>
          <Button variant="default" size="sm" className="rounded-full px-4 py-2">
            Reservar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ServiceItem

