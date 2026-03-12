import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Services from "@/pages/Services";
import Clients from "@/pages/Clients";
import Machines from "@/pages/Machines";
import Operators from "@/pages/Operators";
import Finance from "@/pages/Finance";
import Freights from "@/pages/Freights";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  if (location === '/login') {
    return <Route path="/login" component={Auth} />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/servicos" component={Services} />
        <Route path="/clientes" component={Clients} />
        <Route path="/maquinas" component={Machines} />
        <Route path="/operadores" component={Operators} />
        <Route path="/financeiro" component={Finance} />
        <Route path="/fretes" component={Freights} />
        <Route path="/relatorios" component={Reports} />
        <Route path="/perfil" component={Profile} />
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