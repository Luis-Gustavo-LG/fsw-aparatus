"use client";

import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { useBooking } from "../hooks/use-booking";
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarbershopSectionCentralizer,
  BarbershopSectionSpacing,
  BarbershopSectionTitle,
} from "./page";
import ContactPhoneItem from "./contact-phone-item";
import Image from "next/image";
import { useCancelBooking } from "../hooks/use-cancel-booking";
import { useRescheduleBooking } from "../hooks/use-reschedule-booking";

interface BookingProps {
  children: React.ReactNode;
  bookingId: string;
}

const formatPrice = (priceInCents: number) => {
  const price = priceInCents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};

const BookingInfo = ({ children, bookingId }: BookingProps) => {
  const { data: booking, isLoading, error } = useBooking(bookingId);

  const { mutate: cancelBooking, isPending: isCancelingBooking } =
    useCancelBooking();

  const { mutate: rescheduleBooking, isPending: isRescheduling } =
    useRescheduleBooking();

  if (isLoading) return <div className="p-6">Carregando...</div>;
  if (error) return <div className="p-6 text-red-500">{String(error)}</div>;
  if (!booking) return <div className="p-6">Agendamento não encontrado.</div>;

  // --- Agora o status vem do backend ---
  const bookingStatus = booking.cancelled ? "inactive" : "confirmed";

  const handleDelete = () => cancelBooking(bookingId);

  const handleReschedule = () => rescheduleBooking(bookingId);

  return (
    <Sheet>
      {children}

      <SheetContent side="right" className="w-[450px]">
        <SheetHeader>
          <SheetTitle>Informações da Reserva</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col p-5 space-y-5">
          
          {/* MAPA + BARBEARIA */}
          <div className="relative rounded-xl min-w-[400px] min-h-[200px]">
            <Image
              fill
              src="/map.png"
              alt="Mapa"
              className="rounded-xl object-cover"
            />
            <div className="absolute flex items-center gap-2 font-semibold z-20 p-3 rounded-xl bg-card bottom-5 left-[10%]">
              <div className="relative rounded-[20px] shrink-0 size-[40px] overflow-hidden">
                <Image
                  alt={booking.barbershop.name}
                  src={booking.barbershop.imageUrl}
                  fill
                  className="rounded-[10px] object-cover"
                />
              </div>
              {booking.barbershop.name}
            </div>
          </div>

          {/* STATUS */}
          <p
            className={`${
              bookingStatus === "confirmed"
                ? "bg-primary"
                : "bg-destructive text-card-foreground"
            } place-self-start text-muted px-4 py-1 rounded-xl`}
          >
            {bookingStatus === "confirmed" ? "Confirmado" : "Cancelado"}
          </p>

          {/* BOX DE INFORMAÇÕES */}
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex justify-between w-full">
              <div className="flex flex-col items-start gap-3">
                <p className="font-bold text-xl text-card-foreground">
                  {booking.service.name}
                </p>
                <p className="font-normal text-xl text-card-foreground">Data</p>
                <p className="font-normal text-xl text-card-foreground">Horário</p>
                <p className="font-normal text-xl text-card-foreground">Barbearia</p>
              </div>

              <div className="flex flex-col items-end gap-3 text-right">
                <p className="font-bold text-xl text-muted-foreground">
                  {formatPrice(booking.service.priceInCents)}
                </p>
                <p className="font-normal text-xl text-muted-foreground">
                  {format(new Date(booking.date), "dd 'de' MMMM", {
                    locale: ptBR,
                  })}
                </p>
                <p className="font-normal text-xl text-muted-foreground">
                  {format(new Date(booking.date), "HH:mm")}
                </p>
                <p className="font-normal text-xl text-muted-foreground">
                  {booking.barbershop.name}
                </p>
              </div>
            </div>
          </div>

          {/* CONTATO */}
          <BarbershopSectionSpacing>
            <BarbershopSectionCentralizer>
              <BarbershopSectionTitle>CONTATO</BarbershopSectionTitle>
            </BarbershopSectionCentralizer>

            <div className="flex flex-col gap-3">
              {booking.barbershop.phones.map((phone, index) => (
                <ContactPhoneItem key={index} phone={phone} />
              ))}
            </div>
          </BarbershopSectionSpacing>
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 items-center justify-center p-4">
          {/* VOLTAR */}
          <SheetClose className="w-[50%] h-10 rounded-2xl bg-primary text-background hover:bg-muted hover:text-card-foreground hover:border">
            Voltar
          </SheetClose>

          {/* AÇÕES BASEADAS NO STATUS */}
          {bookingStatus === "confirmed" ? (
            <Button
              className="w-[50%] h-10 rounded-2xl bg-destructive hover:bg-card-foreground"
              onClick={handleDelete}
            >
              {isCancelingBooking ? "Cancelando..." : "Cancelar Agendamento"}
            </Button>
          ) : bookingStatus === "inactive" &&
            isAfter(booking.date, new Date()) ? (
            <Button
              className="w-[50%] h-10 rounded-2xl bg-primary hover:bg-card-foreground"
              onClick={handleReschedule}
            >
              {isRescheduling ? "Carregando..." : "Re-agendar"}
            </Button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BookingInfo;
