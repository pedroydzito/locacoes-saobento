import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Services from "@/pages/Services";
import ServiceDetailPage from "@/pages/ServiceDetailPage";
import Machines from "@/pages/Machines";
import MachineDetailPage from "@/pages/MachineDetailPage";
import Operators from "@/pages/Operators";
import OperatorDetailPage from "@/pages/OperatorDetailPage";
import Finance from "@/pages/Finance";
import FinanceDetailPage from "@/pages/FinanceDetailPage";
import Freights from "@/pages/Freights";
import FreightDetailPage from "@/pages/FreightDetailPage";
import Clients from "@/pages/Clients";
import ClientDetailPage from "@/pages/ClientDetailPage";
import Reports from "@/pages/Reports";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";
import OperatorPortal from "@/pages/OperatorPortal";
import DriverPortal from "@/pages/DriverPortal";
import MechanicPortal from "@/pages/MechanicPortal";
import Inventory from "@/pages/Inventory";
import InventoryDetailPage from "@/pages/InventoryDetailPage";
import { useEffect } from "react";

function getSession() {
  return {
    isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
    userRole: localStorage.getItem("userRole") || "",
  };
}

function AdminRoute({ component: Component }: { component: any }) {
  return <Component />;
}

function Router() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, userRole } = getSession();

  useEffect(() => {
    if (!isAuthenticated && location !== "/login") {
      setLocation("/login");
    }
  }, [isAuthenticated, location, setLocation]);

  if (!isAuthenticated || location === "/login") {
    return <Route path="/login" component={Auth} />;
  }

  if (userRole === "operador") {
    return <OperatorPortal />;
  }
  if (userRole === "motorista") {
    return <DriverPortal />;
  }
  if (userRole === "mecanico") {
    return <MechanicPortal />;
  }

  if (location === "/portal") {
    return <OperatorPortal />;
  }
  if (location === "/portal/motorista") {
    return <DriverPortal />;
  }
  if (location === "/portal/mecanico") {
    return <MechanicPortal />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={() => <AdminRoute component={Dashboard} />} />
        <Route path="/servicos" component={() => <AdminRoute component={Services} />} />
        <Route path="/servicos/:id" component={() => <AdminRoute component={ServiceDetailPage} />} />
        <Route path="/maquinas" component={() => <AdminRoute component={Machines} />} />
        <Route path="/maquinas/:id" component={() => <AdminRoute component={MachineDetailPage} />} />
        <Route path="/fretes" component={() => <AdminRoute component={Freights} />} />
        <Route path="/fretes/:id" component={() => <AdminRoute component={FreightDetailPage} />} />
        <Route path="/clientes" component={() => <AdminRoute component={Clients} />} />
        <Route path="/clientes/:id" component={() => <AdminRoute component={ClientDetailPage} />} />
        <Route path="/operadores" component={() => <AdminRoute component={Operators} />} />
        <Route path="/operadores/:id" component={() => <AdminRoute component={OperatorDetailPage} />} />
        <Route path="/financeiro" component={() => <AdminRoute component={Finance} />} />
        <Route path="/financeiro/:id" component={() => <AdminRoute component={FinanceDetailPage} />} />
        <Route path="/estoque" component={() => <AdminRoute component={Inventory} />} />
        <Route path="/estoque/:id" component={() => <AdminRoute component={InventoryDetailPage} />} />
        <Route path="/relatorios" component={() => <AdminRoute component={Reports} />} />
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
