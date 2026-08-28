import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Users, Tractor, Pickaxe, DollarSign, FileText,
  Truck, Menu, Bell, LogOut, User, ChevronLeft, ChevronRight, 
  MoreHorizontal, Settings, PanelLeftClose, PanelLeftOpen, Package
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileBottomNav from "./MobileBottomNav";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
}

const mainNavItems = [
  { name: "Início", href: "/", icon: Home },
  { name: "Obras & Serviços", href: "/servicos", icon: Pickaxe },
  { name: "Máquinas", href: "/maquinas", icon: Tractor },
  { name: "Fretes", href: "/fretes", icon: Truck },
  { name: "Clientes", href: "/clientes", icon: User },
];

const secondaryNavItems = [
  { name: "Operadores", href: "/operadores", icon: Users },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Estoque", href: "/estoque", icon: Package },
  { name: "Relatórios", href: "/relatorios", icon: FileText },
];

export default function AppLayout({ children, title, showBack, backTo }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "operador");

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(false);
    };
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
      <aside
        className={`hidden lg:flex flex-col bg-primary text-primary-foreground shrink-0 z-50  transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-72"
          }`}
      >
        <div className={`h-20 flex items-center justify-between px-4 pt-4 mb-1 relative ${isCollapsed ? "flex-col px-0 gap-4" : ""}`}>
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="w-10 h-10 overflow-hidden relative flex-shrink-0">
                <img src="/logo-branca2.svg" alt="Logo São Bento Locações" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-[10px] leading-none font-display tracking-tight text-white/70">Locações</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-bold text-lg leading-none font-display tracking-tight text-white">São</span>
                  <span className="font-bold text-lg leading-none font-display tracking-tight text-[#FFD700]">Bento</span>
                </div>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mt-1 leading-none">Logística</span>
              </div>
            </motion.div>
          ) : (
            <div className="w-10 h-10 mx-auto overflow-hidden relative flex-shrink-0">
              <img src="/logo-branca2.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`text-white/40 hover:text-white hover:bg-white/10 h-8 w-8 rounded-lg border border-white/10 transition-all ${isCollapsed ? "" : "ml-auto"}`}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4 no-scrollbar">
          <div className="space-y-1.5 mb-10">
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] mb-4">Operação</p>
            )}
            {mainNavItems.map((item) => {
              const isActive = location === item.href;
              const getIconColor = () => {
                if (!isActive) return "text-white/50";
                return "text-white";
              };
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer group ${isActive
                      ? "bg-white/12 text-white font-bold "
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}>
                    <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${getIconColor()}`} strokeWidth={isActive ? 2.5 : 2} />
                    {!isCollapsed && (
                      <span className="text-sm tracking-tight overflow-hidden whitespace-nowrap">{item.name}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="space-y-1.5">
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] mb-4">Administrativo</p>
            )}
            {secondaryNavItems.filter(item => userRole === 'admin' || item.href === '/operadores').map((item) => {
              const isActive = location === item.href;
              const getIconColor = () => {
                if (!isActive) return "text-white/50";
                return "text-white";
              };
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer group ${isActive
                      ? "bg-white/12 text-white font-bold "
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}>
                    <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${getIconColor()}`} strokeWidth={isActive ? 2.5 : 2} />
                    {!isCollapsed && (
                      <span className="text-sm tracking-tight overflow-hidden whitespace-nowrap">{item.name}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile Area (Desktop Sidebar Bottom) */}
        <div className={`p-4 border-t border-white/10 bg-black/10 ${isCollapsed ? "flex justify-center" : ""}`}>
          <div className="flex items-center justify-between group w-full">
            <div className={`flex items-center gap-3 ${isCollapsed ? "hidden" : "flex"}`}>
              <div className="w-10 h-10 rounded-full bg-white/15 border border-white/10 flex items-center justify-center text-white font-bold shrink-0">
                {userRole === 'admin' ? 'A' : 'O'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate">Usuário Google</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">{userRole}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all ${isCollapsed ? "w-12 h-12" : "w-10 h-10"}`}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCollapsed ? "center" : "end"} side={isCollapsed ? "right" : "bottom"} className="w-48 rounded-xl z-[100]">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer rounded-lg">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer rounded-lg">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do ERP</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header (Mobile Only) */}
        <header className="h-16 lg:hidden bg-white border-b border-border items-center px-4 gap-4 flex shrink-0 sticky top-0 z-[40]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 overflow-hidden">
              <img src="/logo-locacoes.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-bold font-display text-primary leading-none">Locações</h1>
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">São Bento</p>
            </div>
          </div>

          <div className="ml-auto">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-background ring-offset-2 ring-offset-border">
              {userRole === 'admin' ? 'A' : 'O'}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="px-4 py-6 sm:px-6 lg:px-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Context Tooltip/Header (Desktop only) */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div className="flex items-center">
                {showBack && backTo && (
                  <Link href={backTo}>
                    <Button variant="ghost" size="sm" className="mr-4 -ml-2 rounded-xl text-muted-foreground hover:text-foreground">
                      ← Voltar
                    </Button>
                  </Link>
                )}
                <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">{title}</h2>
              </div>
              <div className="flex items-center gap-4">
              </div>
            </div>

            {children}
          </div>
        </div>
      </main>

      {/* Bottom Nav (Mobile Only) */}
      <MobileBottomNav />
    </div>
  );
}

function Badge({ className, variant, ...props }: any) {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
      {...props}
    />
  );
}