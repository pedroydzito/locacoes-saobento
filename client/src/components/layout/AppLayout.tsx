import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Tractor, Wheat, Package,
  Truck, Fuel, Settings, Menu, Bell, ShieldAlert, DollarSign, FileText, Pickaxe
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MobileBottomNav from "./MobileBottomNav";

interface AppLayoutProps {
  children: ReactNode;
}

const mainNavItems = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Obras & Serv", href: "/servicos", icon: Pickaxe },
  { name: "Máquinas", href: "/maquinas", icon: Tractor },
  { name: "Fretes", href: "/fretes", icon: Truck },
];

const secondaryNavItems = [
  { name: "Operadores", href: "/operadores", icon: Users },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Relatórios", href: "/relatorios", icon: FileText },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "operador");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Auth check
    const auth = localStorage.getItem("isAuthenticated");
    if (!auth && location !== '/login') {
      setLocation('/login');
    }

    const role = localStorage.getItem("userRole");
    if (role) setUserRole(role);

    return () => window.removeEventListener('resize', checkMobile);
  }, [location, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    setLocation('/login');
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden sm:flex w-64 flex-col border-r border-border bg-card">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Fazenda São Bento" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg font-display tracking-tight text-foreground">São Bento</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1 mb-8">
            <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Operação</p>
            {mainNavItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                    <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : ""}`} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {userRole === 'admin' && (
            <div className="space-y-1">
              <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Gestão</p>
              {secondaryNavItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}>
                      <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : ""}`} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Link href="/perfil">
            <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer ${location === '/perfil' ? 'bg-muted' : 'hover:bg-muted'}`}>
              <Avatar className="w-10 h-10 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {userRole === 'admin' ? 'AS' : 'OP'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-foreground truncate">
                  {userRole === 'admin' ? 'Admin Silva' : 'Operador'}
                </span>
                <span className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <ShieldAlert className="w-3 h-3 text-primary" />
                  {userRole === 'admin' ? 'Administrador' : 'Operador'}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border bg-card/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Fazenda São Bento" className="w-8 h-8 object-contain sm:hidden" />
            <h1 className="font-bold text-lg font-display tracking-tight text-foreground sm:hidden">São Bento</h1>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted rounded-full w-10 h-10">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary rounded-full border-2 border-card"></span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}