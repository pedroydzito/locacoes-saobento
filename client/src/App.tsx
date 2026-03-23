import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Services from "@/pages/Services";
import Machines from "@/pages/Machines";
import Operators from "@/pages/Operators";
import Finance from "@/pages/Finance";
import Freights from "@/pages/Freights";
import Reports from "@/pages/Reports";
import Auth from "@/pages/Auth";
import Clients from "@/pages/Clients";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function ProtectedRoute({ component: Component, allowedRoles }: { component: any, allowedRoles?: string[] }) {
  const [location, setLocation] = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole") || "operador";

  useEffect(() => {
    if (!isAuthenticated && location !== '/login') {
      setLocation('/login');
    } else if (isAuthenticated && allowedRoles && !allowedRoles.includes(userRole)) {
      setLocation('/');
    }
  }, [isAuthenticated, location, setLocation, userRole, allowedRoles]);

  if (!isAuthenticated) return null;
  if (allowedRoles && !allowedRoles.includes(userRole)) return null;

  return <Component />;
}

function Router() {
  const [location] = useLocation();

  if (location === '/login') {
    return <Route path="/login" component={Auth} />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
        <Route path="/servicos" component={() => <ProtectedRoute component={Services} />} />
        <Route path="/maquinas" component={() => <ProtectedRoute component={Machines} />} />
        <Route path="/fretes" component={() => <ProtectedRoute component={Freights} />} />
        <Route path="/clientes" component={() => <ProtectedRoute component={Clients} />} />
        
        {/* Gestão - Apenas Admin */}
        <Route path="/operadores" component={() => <ProtectedRoute component={Operators} allowedRoles={['admin']} />} />
        <Route path="/financeiro" component={() => <ProtectedRoute component={Finance} allowedRoles={['admin']} />} />
        <Route path="/relatorios" component={() => <ProtectedRoute component={Reports} allowedRoles={['admin']} />} />
        
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;