import { ReactNode } from "react";
import { Link, useLocation, useLocation as useWouterLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Tractor,
  HardHat, Truck, CircleDollarSign, 
  BarChart3, Bell, Search, Menu
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Obras & Serviços", href: "/servicos", icon: HardHat },
  { name: "Máquinas", href: "/maquinas", icon: Tractor },
  { name: "Operadores", href: "/operadores", icon: Users },
  { name: "Fretes", href: "/fretes", icon: Truck },
  { name: "Financeiro", href: "/financeiro", icon: CircleDollarSign },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Tractor className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Locações</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            <p className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Menu Principal</p>
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                    <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border/50">
          <Link href="/perfil">
            <div className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors cursor-pointer ${location === '/perfil' ? 'bg-muted' : 'hover:bg-muted'}`}>
              <Avatar className="w-9 h-9 border border-border/50">
                <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Admin Silva</span>
                <span className="text-xs text-muted-foreground">Administrador</span>
              </div>
            </div>
          </Link>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar obras, máquinas, clientes..." 
                className="w-[300px] h-9 pl-9 pr-4 rounded-full bg-muted/50 border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-background"></span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}