import { Switch, Route } from "wouter";
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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/servicos" component={Services} />
      <Route path="/clientes" component={Clients} />
      <Route path="/maquinas" component={Machines} />
      <Route path="/operadores" component={Operators} />
      <Route path="/financeiro" component={Finance} />
      
      {/* Other routes can map to Dashboard for now to simulate the skeleton */}
      <Route path="/fretes" component={Dashboard} />
      <Route path="/relatorios" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout>
          <Router />
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;