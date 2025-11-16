"use client"

import { useAction } from "next-safe-action/hooks"
import { getBookingInfo } from "@/app/actions/get-booking-info"
import { useQuery } from "@tanstack/react-query"

export function useBooking(bookingId: string) {

  const { executeAsync } = useAction(getBookingInfo)

  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const result = await executeAsync({ bookingId })

      if (result?.serverError) {
        throw new Error(result.serverError)
      }

      if (result?.validationErrors?._errors) {
        throw new Error(result.validationErrors._errors[0])
      }

      return result?.data
    },
    enabled: !!bookingId,
  })
}
