import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import BookingInfo from "./booking-info";

interface BookingInterface {
  serviceName: string | undefined;
  barbershopName: string | undefined;
  barbershopImageUrl: string | undefined;
  date: Date | undefined;
  status: 'confirmed' | 'inactive';
  bookingId: string
}

const BookingItem = ({
    serviceName,
    barbershopName,
    barbershopImageUrl,
    date,
    status,
    bookingId
  }: BookingInterface) => {
    return (
      <BookingInfo bookingId={bookingId}>
        <SheetTrigger asChild>
          <Card className="flex w-full flex-row items-center justify-between p-0 cursor-pointer">
  
            {/* Esquerda */}
            <div className="flex flex-col gap-4 flex-1 p-6">
              <Badge className={status === "confirmed" ? "bg-primary" : "bg-destructive"}>
                {status === "confirmed" ? "Confirmado" : "Cancelado"}
              </Badge>
  
              <div className="flex flex-col gap-2">
                <p className="font-bold">{serviceName}</p>
  
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={barbershopImageUrl} />
                  </Avatar>
                  <p>{barbershopName}</p>
                </div>
              </div>
            </div>
  
            {/* Direita */}
            <div className="flex flex-col items-center justify-center p-4 h-full border-l py-3">
              <p className="text-2xs capitalize">
                {date?.toLocaleDateString("pt-BR", { month: "long" })}
              </p>
  
              <p className="text-3xl">
                {date?.toLocaleDateString("pt-BR", { day: "2-digit" })}
              </p>
  
              <p className="text-2xs capitalize">
                {date?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            
          </Card>
        </SheetTrigger>
      </BookingInfo>
    );
  };

export default BookingItem;
