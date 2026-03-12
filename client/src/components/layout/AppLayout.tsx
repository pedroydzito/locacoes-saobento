import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Home, Users, Tractor, Pickaxe, DollarSign, FileText,
  Truck, Menu, Bell, LogOut
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MobileBottomNav from "./MobileBottomNav";

interface AppLayoutProps {
  children: ReactNode;
}

const mainNavItems = [
  { name: "Início", href: "/", icon: Home },
  { name: "Obras & Serviços", href: "/servicos", icon: Pickaxe },
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
    <div className="flex h-screen w-full bg-[#f8f9fa] overflow-hidden font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden sm:flex w-64 flex-col bg-[#1b431e] text-white">
        <div className="h-24 flex items-center px-6 pt-6 mb-2 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 overflow-hidden relative flex-shrink-0 rounded-full bg-white/5">
              <img src="/logo-color.png" alt="Logo Fazenda São Bento" className="absolute top-0 left-0 w-full h-[135%] object-cover object-top" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[18px] leading-tight font-display tracking-tight text-white">Fazenda</span>
              <span className="font-bold text-[18px] leading-tight font-display tracking-tight text-[#e87c2b]">São Bento</span>
              <span className="text-[10px] tracking-widest text-[#7a957a] font-bold uppercase mt-0.5">LOCAÇÕES</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1 mb-10">
            <p className="px-4 text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">Operação</p>
            {mainNavItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-[#255529] text-white font-medium shadow-sm" 
                      : "text-white/70 hover:bg-[#255529]/50 hover:text-white"
                  }`}>
                    <item.icon className={`w-5 h-5 ${isActive ? "text-[#d5a05b]" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {userRole === 'admin' && (
            <div className="space-y-1">
              <p className="px-4 text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">Gestão</p>
              {secondaryNavItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <div className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? "bg-[#255529] text-white font-medium shadow-sm" 
                        : "text-white/70 hover:bg-[#255529]/50 hover:text-white"
                    }`}>
                      <item.icon className={`w-5 h-5 ${isActive ? "text-[#d5a05b]" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#255529] border border-[#d5a05b]/30 flex items-center justify-center text-white font-bold text-sm">
              {userRole === 'admin' ? 'U' : 'O'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">
                Usuário Google
              </span>
              <span className="text-xs text-[#d5a05b] truncate mt-0.5 font-medium">
                {userRole === 'admin' ? 'Admin' : 'Operador'}
              </span>
            </div>
          </div>
          
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium w-full px-2">
            <LogOut className="w-4 h-4" />
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-[#f8f9fa] z-10 sticky top-0 sm:border-b sm:border-border/50">
          <div className="flex items-center gap-2 sm:hidden">
            <div className="w-8 h-8 overflow-hidden relative flex-shrink-0 rounded-full">
              <img src="/logo-color.png" alt="Logo Fazenda São Bento" className="absolute top-0 left-0 w-full h-[135%] object-cover object-top" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                 <span className="font-bold text-sm leading-none font-display text-[#1b431e]">Fazenda</span>
                 <span className="font-bold text-sm leading-none font-display text-[#e87c2b]">São Bento</span>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <Menu className="w-5 h-5" />
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-8 h-8 rounded-full bg-primary/10 sm:hidden flex items-center justify-center text-primary font-bold text-xs">
               {userRole === 'admin' ? 'U' : 'O'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 sm:pb-8">
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