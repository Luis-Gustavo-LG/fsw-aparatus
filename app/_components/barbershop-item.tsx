import Image from "next/image"
import { Barbershop } from "../generated/prisma/client"

interface BarbershopItemsProps {
    barbershop: Barbershop
}

const BarbershopItem = ({ barbershop }: BarbershopItemsProps) => {
  return (
    <div className="relative rounded-xl min-w-[290px] min-h-[200px]">
        <div className="bg-linear-to-t from-black to-transparent h-full w-full absolute top-0 left-0 rounded-lg z-10"/>
        <Image
            src={barbershop.imageUrl}
            alt={barbershop.name}
            fill
            className="rounded-xl object-cover"         
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
            <h3 className="text-background text-lg font-bold">{barbershop.name}</h3>
            <p className="text-background text-xs">{barbershop.address}</p>
        </div>
    </div>
  )
}

export default BarbershopItem