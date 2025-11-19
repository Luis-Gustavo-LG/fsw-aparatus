"use client"

import { useState, useEffect } from "react"
import { BarbershopService, Barbershop } from "../generated/prisma/client"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { Calendar } from "./ui/calendar"
import { Button } from "./ui/button"
import { getBarbershop } from "../actions/get-barbershop"
import { useAction } from "next-safe-action/hooks"
import { createBooking } from "../actions/create-booking"
import { toast } from "sonner"
import { ptBR } from "date-fns/locale"
import { useQuery } from "@tanstack/react-query"
import { getDateAvailableTimeSlots } from "../actions/get-date-available-time-slots"
import { Spinner } from "./ui/spinner"
import { createBookingCheckoutSession } from "../actions/create-booking-checkout-session"
import { loadStripe } from '@stripe/stripe-js'

interface BookingSheetProps {
  service: BarbershopService
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatPrice = (priceInCents: number) => {
  const price = priceInCents / 100
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

const formatDate = (date: Date): string => {
  const day = date.getDate()
  const month = date.toLocaleDateString("pt-BR", { month: "long" })
  return `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)}`
}

const BookingSheet = ({ service, open, onOpenChange }: BookingSheetProps) => {
  const { executeAsync: executeCreateBookingCheckoutSession } = useAction(createBookingCheckoutSession)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [loading, setLoading] = useState(false)
  const { executeAsync, isPending} = useAction(createBooking)
  const {data: availableTimeSlot, isPending: isTimeSlotPending} = useQuery({
    queryKey: ['date-available-time-slot', service.barberShopId, selectedDate],
    queryFn: () => getDateAvailableTimeSlots({
      barberShopId: service.barberShopId,
      date: selectedDate!
    }),
    enabled: !!selectedDate
  })

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  useEffect(() => {
    if (!open || !service.barberShopId) return

    let cancelled = false

    Promise.resolve().then(() => setLoading(true))

    getBarbershop(service.barberShopId)
      .then((data) => {
        if (!cancelled) setBarbershop(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, service.barberShopId])


  useEffect(() => {
    if (!open) {
      Promise.resolve().then(() => {
        setSelectedDate(undefined)
        setSelectedTime(undefined)
      })
    }
  }, [open])

  useEffect(() => {
    if (selectedDate) {
      Promise.resolve().then(() => setSelectedTime(undefined))
    }
  }, [selectedDate])


  const handleConfirm = async () => {

    if(!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY){
      toast.error("Erro ao criar checkout session")
      return
    }

    if(!selectedDate || !selectedTime){
      toast.error("Selecione uma data")
      return
    }

    const timeSplitted = selectedTime.split(":")
      const hours = parseInt(timeSplitted[0])
      const minutes = parseInt(timeSplitted[1])
      const date = new Date(selectedDate)
      date.setHours(hours, minutes)

    const checkoutSessionResult = await executeCreateBookingCheckoutSession({
      serviceId: service.id,
      date: date
    })
    if(checkoutSessionResult.serverError || checkoutSessionResult.validationErrors){
      toast.error(checkoutSessionResult.validationErrors?._errors?.[0])
      return
    }

    const checkoutUrl = checkoutSessionResult.data?.url;

    if (!checkoutUrl) {
    toast.error("Erro ao criar checkout session");
    return;
    }

    window.location.href = checkoutUrl;
      }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[350px] p-5 rounded-t-xl flex flex-col">
        <SheetHeader className="px-0">
          <SheetTitle className="text-left text-lg font-semibold">Fazer Reserva</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-4 flex-1 overflow-y-auto overflow-x-hidden">

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md w-full"
              locale={ptBR}
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            isTimeSlotPending ? (
            <div className="flex items-center justify-center p-4 h-fit">
              <Spinner className="size-15"/>
            </div>
            ) : (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2 -mx-1 px-1">
                {availableTimeSlot?.data?.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="default"
                    className="rounded-full whitespace-nowrap shrink-0"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
            )
          )}

          {/* Summary */}
          {selectedDate && selectedTime && (
            <div className="p-4 bg-card border border-border rounded-lg">

              <div className="flex justify-between w-full">

                <div className="flex flex-col items-start gap-3">
                  <p className="font-bold text-xl text-card-foreground">
                    {service.name}
                  </p>
                  <p className="font-normal text-xl text-card-foreground">Data</p>
                  <p className="font-normal text-xl text-card-foreground">Horário</p>
                  <p className="font-normal text-xl text-card-foreground">Barbearia</p>
                </div>

                <div className="flex flex-col items-end gap-3 text-right">
                  <p className="font-bold text-xl text-muted-foreground">
                    {formatPrice(service.priceInCents)}
                  </p>
                  <p className="font-normal text-xl text-muted-foreground">
                    {formatDate(selectedDate)}
                  </p>
                  <p className="font-normal text-xl text-muted-foreground">
                    {selectedTime}
                  </p>
                  {barbershop && (
                    <p className="font-normal text-xl text-muted-foreground">
                      {barbershop.name}
                    </p>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

        <div className="mt-auto mb-3 pt-4 border-t border-border">
          <Button
            variant="default"
            className="w-full rounded-full"
            disabled={!selectedDate || !selectedTime || isPending}
            onClick={handleConfirm}
          >
            {isPending ? "Criando agendamento..." : "Confirmar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default BookingSheet
