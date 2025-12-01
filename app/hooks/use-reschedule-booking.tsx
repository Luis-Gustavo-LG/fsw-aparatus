"use client"

import { useMutation } from "@tanstack/react-query";
import { rescheduleBooking } from "../actions/reschedule-booking";

export function useRescheduleBooking() {

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const result = await rescheduleBooking({ bookingId });
    
      if (result.data?.url) {
        window.location.href = result.data?.url;
        return;
      }
    
      throw new Error("Erro ao iniciar re-agendamento");
    },
    
  });
}
