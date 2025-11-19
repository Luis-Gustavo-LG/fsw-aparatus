import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelBooking } from "../actions/cancel-booking";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const result = await cancelBooking({ bookingId });

      if (result?.validationErrors) {
        throw new Error(result.validationErrors._errors?.[0]);
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Agendamento cancelado!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
