"use client";

import { useRouter } from "next/navigation";
import { House, CalendarDays, LogOut, MessageSquareMore } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "./ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

interface MenuProps {
  children?: React.ReactNode;
}

const Menu = ({ children }: MenuProps) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh()
    router.push("/")
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const categories = [{
    name: "Cabelo",
    path: "/search?query=Cabelo"
  }, {
    name: "Barba",
    path: "/search?query=Barba"
  }, {
    name: "Acabamento",
    path: "/search?query=Acabamento"
  }, {
    name: "Sombrancelha",
    path: "/search?query=Sombrancelha"
  }, {
    name: "Massagem",
    path: "/search?query=Massagem"
  }, {
    name: "Hidratação",
    path: "/search?query=Hidratação"
  }]

  const menuItems = [
    {
      name: "Início",
      path: "/",
      icon: House
    },
    {
      name: "Agendamentos",
      path: "/bookings",
      icon: CalendarDays
    },
    {
      name: "Chat",
      path: "/chat",
      icon: MessageSquareMore
    }
  ]

  return (
    <Sheet>
      {children}
      <SheetContent side="right" className="w-[350px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-5 py-6 flex flex-row items-center justify-between">
            <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
            {session?.user ? (
              <>
                <Separator />
                
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    {session.user.image && (
                      <AvatarImage src={session.user.image} alt={session.user.name} />
                    )}
                    <AvatarFallback>
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-base font-semibold text-foreground leading-[1.4]">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground leading-[1.4]">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-0">
                  {menuItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Button
                        variant="ghost"
                        className="justify-start gap-3 h-auto py-3 px-5 rounded-full"
                        onClick={() => handleNavigation(item.path)}
                      >
                        <item.icon className="size-4" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Button>
                    </SheetClose>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col gap-1">
                  {categories.map((category) => (
                    <Button
                      key={category.name}
                      onClick={() => handleNavigation(category.path)}
                      variant="ghost"
                      className="justify-start h-10 px-5 rounded-full"
                    >
                        <span className="text-sm font-medium">{category.name}</span>
                    </Button>
                  ))}
                </div>

                <Separator />

                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 h-auto py-3 px-5 rounded-full text-muted-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    <span className="text-sm font-medium">Sair da conta</span>
                  </Button>
                </SheetClose>
              </>
            ) : (
              <>
                <Separator />
                
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-base font-semibold text-foreground mb-2">
                    Faça login para continuar
                  </p>
                  <p className="text-sm text-muted-foreground mb-6 text-center">
                    Entre com sua conta para acessar todas as funcionalidades
                  </p>
                  <SheetClose asChild>
                    <Button
                      onClick={() => {
                        authClient.signIn.social({ provider: "google" });
                      }}
                    >
                      Entrar com Google
                    </Button>
                  </SheetClose>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Menu;

