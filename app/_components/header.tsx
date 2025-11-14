"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { MenuIcon } from "lucide-react";
import Menu from "./menu";
import { SheetTrigger } from "./ui/sheet";

const Header = () => {
    return (
        <>
            <header className="flex items-center justify-between px-5 py-6">        
                <Image src="/logo.svg" alt="Aparatus" width={100} height={26.09} />
                <div className="flex items-center gap-2">
                    <Menu>
                        <SheetTrigger asChild>
                            <Button 
                                variant={"outline"} 
                                size={"icon"}
                            >
                                <MenuIcon />
                            </Button>
                        </SheetTrigger>
                    </Menu>
                </div>
            </header>
        </>
    )
}

export default Header;