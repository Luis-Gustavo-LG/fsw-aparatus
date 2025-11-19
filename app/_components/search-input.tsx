"use client"

import { SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SearchInput = () => {
  const router = useRouter()
  const [value, setValue] = useState("")

  function handleSearch() {
    if (!value.trim()) return
    router.push(`/search?query=${value}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Pesquise serviços ou barbearias"
        className="rounded-full border-border"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />

      <Button
        variant="default"
        size="icon"
        className="rounded-full"
        onClick={handleSearch}
      >
        <SearchIcon />
      </Button>
    </div>
  )
}

export default SearchInput;
