"use server"

import { prisma } from "@/lib/prisma"
import { Barbershop } from "../generated/prisma/client"

export async function getBarbershop(
  barberShopId: string
): Promise<Barbershop | null> {
  try {
    const barbershop = await prisma.barbershop.findUnique({
      where: {
        id: barberShopId,
      },
    })

    return barbershop
  } catch (error) {
    console.error("Error fetching barbershop:", error)
    return null
  }
}

