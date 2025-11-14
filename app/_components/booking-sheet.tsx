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

const generateTimeSlots = (): string[] => {
  const slots: string[] = []
  for (let hour = 9; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`)
    if (hour < 18) {
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }
  }
  return slots
}

const BookingSheet = ({ service, open, onOpenChange }: BookingSheetProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [loading, setLoading] = useState(false)
  const { executeAsync, isPending} = useAction(createBooking)

  const timeSlots = generateTimeSlots()

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
    if (!selectedDate || !selectedTime) return
      const timeSplitted = selectedTime.split(":")
      const hours = parseInt(timeSplitted[0])
      const minutes = parseInt(timeSplitted[1])
      const date = new Date(selectedDate)
      date.setHours(hours, minutes)
        const result = await executeAsync({
          serviceId: service.id,
          date,
        })
        if(result.serverError || result.validationErrors) {
          toast.error(result.validationErrors?._errors?.[0])
          return
        } 
        toast.success("Agendamento criado com sucesso")
        setSelectedDate(undefined)
        setSelectedTime(undefined)
        onOpenChange(false)
      }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[450px] p-5 rounded-t-xl flex flex-col">
        <SheetHeader className="px-0">
          <SheetTitle className="text-left text-lg font-semibold">Fazer Reserva</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-4 flex-1 overflow-y-auto overflow-x-hidden">

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md w-full"
              formatters={{
                formatCaption: (date: Date) => {
                  const months = [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                  ]
                  return months[date.getMonth()]
                },
                formatWeekdayName: (date) => {
                  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
                  return weekdays[date.getDay()]
                },
              }}
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2 -mx-1 px-1">
                {timeSlots.map((time) => (
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
