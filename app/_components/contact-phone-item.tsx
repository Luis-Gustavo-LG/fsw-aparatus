"use client"

import { toast } from "sonner"
import { Button } from "./ui/button"
import { Smartphone } from "lucide-react"

interface ContactPhoneItemProps {
  phone: string
}

const ContactPhoneItem = ({ phone }: ContactPhoneItemProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone)
      toast("Telefone copiado")
    } catch (err) {
      toast("Erro ao copiar o telefone", {
        description: `${err}`
      })
    }
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex gap-2.5 items-center">
        <Smartphone className="size-6 shrink-0" />
        <p className="font-normal text-sm leading-[1.4] text-foreground">
          {phone}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={handleCopy}
      >
        Copiar
      </Button>
    </div>
  )
}

export default ContactPhoneItem

