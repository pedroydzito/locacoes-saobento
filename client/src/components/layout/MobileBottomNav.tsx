import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Truck, Tractor, Home, Users, Pickaxe, DollarSign, FileText, MoreHorizontal, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const mainNavItems = [
  { name: "Início", href: "/", icon: Home },
  { name: "Obras", href: "/servicos", icon: Pickaxe },
  { name: "Máquinas", href: "/maquinas", icon: Tractor },
  { name: "Fretes", href: "/fretes", icon: Truck },
];

const secondaryNavItems = [
  { name: "Operadores", href: "/operadores", icon: Users },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Relatórios", href: "/relatorios", icon: FileText },
];

export default function MobileBottomNav() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("operador");

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "operador");
  }, []);

  return (
    <>
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-[72px] pb-safe bg-white border-t border-border z-50 flex items-center justify-around px-2">
        {mainNavItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className="flex flex-col items-center justify-center w-16 h-full cursor-pointer relative pt-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors ${isActive ? "bg-primary/10 text-[#1b431e]" : "text-muted-foreground"}`}>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-1 ${isActive ? "text-[#1b431e] font-bold" : "text-muted-foreground"}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
        
        <div 
          className="flex flex-col items-center justify-center w-16 h-full cursor-pointer pt-2"
          onClick={() => setIsMenuOpen(true)}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors ${isMenuOpen ? "bg-primary/10 text-[#1b431e]" : "text-muted-foreground"}`}>
            <MoreHorizontal className="w-5 h-5" strokeWidth={isMenuOpen ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-medium ${isMenuOpen ? "text-[#1b431e] font-bold" : "text-muted-foreground"}`}>
            Mais
          </span>
        </div>
      </div>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 pt-4 max-h-[92vh] sm:max-w-md mx-auto">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
          <SheetHeader className="text-left mb-6">
            <SheetTitle className="text-xl font-display font-bold text-[#1b431e]">Mais opções</SheetTitle>
          </SheetHeader>
          
          {userRole === 'admin' && (
            <div className="grid grid-cols-3 gap-4">
              {secondaryNavItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)}>
                    <div className="flex flex-col items-center gap-2 group cursor-pointer">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                        isActive ? 'bg-[#1b431e]/10 text-[#1b431e] border border-[#1b431e]/20' : 'bg-muted text-muted-foreground border border-transparent group-hover:bg-muted/80'
                      }`}>
                        <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className={`text-xs font-medium text-center ${isActive ? 'text-[#1b431e] font-bold' : 'text-foreground'}`}>
                        {item.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-border">
            <div 
              className="flex items-center justify-between bg-muted/50 p-4 rounded-2xl cursor-pointer"
              onClick={() => {
                localStorage.removeItem("isAuthenticated");
                localStorage.removeItem("userRole");
                window.location.href = '/login';
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1b431e]/10 text-[#1b431e] flex items-center justify-center font-bold font-display">
                  {userRole === 'admin' ? 'U' : 'O'}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Usuário Google</p>
                  <p className="text-xs text-muted-foreground">{userRole === 'admin' ? 'Admin' : 'Operador'}</p>
                </div>
              </div>
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}