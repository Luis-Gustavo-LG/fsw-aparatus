import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rescheduleBooking } from "../actions/reschedule-booking";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useRescheduleBooking() {
  const queryClient = useQueryClient();
  const router = useRouter()

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const result = await rescheduleBooking({ bookingId });

      if (result?.validationErrors) {
        throw new Error(result.validationErrors._errors?.[0]);
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Re-agendamento concluído!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
