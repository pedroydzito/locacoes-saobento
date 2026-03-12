import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Wheat, Truck, Tractor, LayoutDashboard, Menu, Fuel, Package, Users, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const mainNavItems = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Colheita", href: "/colheita", icon: Wheat },
  { name: "Transporte", href: "/fretes", icon: Truck },
  { name: "Máquinas", href: "/maquinas", icon: Tractor },
];

const secondaryNavItems = [
  { name: "Abastecimento", href: "/abastecimento", icon: Fuel },
  { name: "Estoque", href: "/estoque", icon: Package },
  { name: "Caminhões", href: "/caminhoes", icon: Truck },
  { name: "Usuários", href: "/operadores", icon: Users },
];

export default function MobileBottomNav() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-[72px] pb-safe bg-card border-t border-border z-50 flex items-center justify-around px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        {mainNavItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className="flex flex-col items-center justify-center w-16 h-full cursor-pointer relative">
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute top-0 w-8 h-1 bg-primary rounded-b-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className={`w-6 h-6 mb-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
        
        <div 
          className="flex flex-col items-center justify-center w-16 h-full cursor-pointer"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu className={`w-6 h-6 mb-1 transition-colors ${isMenuOpen ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-[10px] font-medium ${isMenuOpen ? "text-primary font-bold" : "text-muted-foreground"}`}>
            Mais
          </span>
        </div>
      </div>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 pt-4 max-h-[92vh] sm:max-w-md mx-auto">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
          <SheetHeader className="text-left mb-6">
            <SheetTitle className="text-xl font-display font-bold">Mais opções</SheetTitle>
          </SheetHeader>
          
          <div className="grid grid-cols-4 gap-4">
            {secondaryNavItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-transparent group-hover:bg-muted/80'
                    }`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-medium text-center ${isActive ? 'text-primary font-bold' : 'text-foreground'}`}>
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <Link href="/perfil" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-display">
                  AS
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Admin Silva</p>
                  <p className="text-xs text-muted-foreground">Ver perfil</p>
                </div>
              </div>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
