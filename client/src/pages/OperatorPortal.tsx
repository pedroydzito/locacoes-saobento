import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Play, StopCircle, Clock, Calendar, CheckCircle2, MapPin, Truck, Wrench, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { mockClients, mockOperators, mockMachines, mockServices, mockInventory, mockTransactions } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function ReportsView({ activeServices, currentOperator, onBack }: { activeServices: any[]; currentOperator: any; onBack: () => void }) {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const targetMonth = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();

  // Gather all dailyLogs for this operator from mockServices
  const allServices = mockServices.filter(s => s.operator === currentOperator.name);

  const monthHours = useMemo(() => {
    return allServices.reduce((total, srv) => {
      const logs: any[] = (srv as any).dailyLogs || [];
      return total + logs.reduce((acc: number, log: any) => {
        const logDate = new Date(log.date);
          if (logDate.getMonth() === targetMonth && logDate.getFullYear() === targetYear) {
            if (log.finalHorimeter && log.initialHorimeter) {
              return acc + (Number(log.finalHorimeter) - Number(log.initialHorimeter));
            }
          }
          return acc;
        }, 0);
    }, 0);
  }, [allServices, targetMonth, targetYear]);

  // Build last 6 months history
  const history = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const h = allServices.reduce((total, srv) => {
        const logs: any[] = (srv as any).dailyLogs || [];
        return total + logs.reduce((acc: number, log: any) => {
          const ld = new Date(log.date);
          if (ld.getMonth() === m && ld.getFullYear() === y) {
            if (log.finalHorimeter && log.initialHorimeter) {
              return acc + (Number(log.finalHorimeter) - Number(log.initialHorimeter));
            }
          }
          return acc;
        }, 0);
      }, 0);
      return { label: `${MONTHS[m].slice(0, 3)}/${y}`, hours: h, isCurrent: m === now.getMonth() && y === now.getFullYear() };
    });
  }, [allServices]);

  const isCurrent = monthOffset === 0;
  const isFuture = monthOffset > 0;

  return (
    <div className="space-y-4 animate-in slide-in-from-right-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">← Voltar</Button>
        <h2 className="text-lg font-bold ml-2">Minhas Horas</h2>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => setMonthOffset(p => p - 1)} disabled={monthOffset <= -12}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <p className="font-bold text-base">{MONTHS[targetMonth]} {targetYear}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            {isFuture ? "Futuro" : isCurrent ? "Mês Atual" : "Fechado"}
          </p>
        </div>
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => setMonthOffset(p => p + 1)} disabled={monthOffset >= 0}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Current month card */}
      <Card className="p-6 rounded-3xl bg-primary text-primary-foreground shadow-lg">
        <p className="text-white/70 text-sm font-medium mb-1">Horas Trabalhadas</p>
        <h3 className="text-5xl font-display font-bold">
          {monthHours.toFixed(1)}<span className="text-xl text-white/50 ml-1">h</span>
        </h3>
        {monthHours === 0 && <p className="text-white/50 text-xs mt-2">Nenhum registro diário neste mês ainda.</p>}
      </Card>

      <h3 className="font-bold text-gray-800 mt-2 mb-2 px-1">Histórico (6 meses)</h3>
      <div className="space-y-2">
        {history.map((m, i) => (
          <Card key={i} className={`p-4 rounded-xl flex justify-between items-center shadow-sm border-border ${m.isCurrent ? 'border-primary/30 bg-primary/5' : ''}`}>
            <span className={`font-medium text-sm ${m.isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{m.label}</span>
            <span className="font-bold text-lg">{m.hours.toFixed(1)} h</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

type ViewMode = "home" | "new-service" | "morning-log" | "afternoon-log" | "finish-service" | "reports";

export default function OperatorPortal() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [selectedService, setSelectedService] = useState<any>(null);

  // We find the current operator by matching the name from localStorage
  const operatorName = localStorage.getItem("operatorName") || mockOperators[0].name;
  const currentOperator = mockOperators.find(op => op.name === operatorName) || mockOperators[0];
  
  // Find active services for this operator
  const [activeServices, setActiveServices] = useState(
    mockServices.filter(s => {
      const isOp = s.operator === currentOperator.name || s.machines?.some(m => m.operatorName === currentOperator.name);
      return isOp && s.status === 'em_andamento';
    })
  );

  // New Service State
  const [newServiceData, setNewServiceData] = useState({
    client: "",
    machine: "",
    date: new Date().toISOString().split('T')[0],
    horimeter: "",
  });

  // Morning Log State
  const [morningLogData, setMorningLogData] = useState({
    date: new Date().toISOString().split('T')[0],
    machine: "",
    initialHorimeter: "",
    serviceType: "",
    maintenance: "",
    partCode: "",
    partQuantity: "",
    notes: ""
  });

  // Afternoon Log State
  const [afternoonLogData, setAfternoonLogData] = useState({
    date: new Date().toISOString().split('T')[0],
    machine: "",
    finalHorimeter: "",
    diesel: "",
    dieselSupplier: "cliente",
  });

  // Finish Service State
  const [finishServiceData, setFinishServiceData] = useState({
    date: new Date().toISOString().split('T')[0],
    machine: "",
    horimeter: ""
  });

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    setLocation('/login');
  };

  const startNewService = () => {
    if (!newServiceData.client || !newServiceData.machine || !newServiceData.horimeter) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    const newService = {
      id: `SRV-${Date.now()}`,
      client: newServiceData.client,
      machine: newServiceData.machine,
      operator: currentOperator.name,
      date: newServiceData.date,
      hora_inicial: Number(newServiceData.horimeter),
      status: "em_andamento",
      hours: 0,
      diesel: 0,
      profit: 0,
      dailyLogs: []
    };
    mockServices.push(newService);
    setActiveServices([...activeServices, newService]);
    toast({ title: "Serviço Iniciado com Sucesso" });
    setViewMode("home");
  };

  const saveMorningLog = () => {
    if (!morningLogData.initialHorimeter) {
      toast({ title: "Preencha o horímetro inicial", variant: "destructive" });
      return;
    }
    
    // Baixa automática no estoque se preencheu manutenção
    if (morningLogData.maintenance && morningLogData.partCode && morningLogData.partQuantity) {
      const itemIndex = mockInventory.findIndex(i => i.code.toLowerCase() === morningLogData.partCode.toLowerCase());
      if (itemIndex !== -1) {
        const qtyToDeduct = Number(morningLogData.partQuantity);
        if (mockInventory[itemIndex].quantity >= qtyToDeduct) {
          mockInventory[itemIndex].quantity -= qtyToDeduct;
          
          const costValue = qtyToDeduct * (mockInventory[itemIndex].unitPrice || 0);
          mockTransactions.push({
            id: `tx-estoque-${Date.now()}`,
            type: "saida",
            amount: costValue,
            date: morningLogData.date,
            description: `Peça/Filtro (${mockInventory[itemIndex].name}) - OS: ${selectedService.id}`,
            account: "Estoque",
            category: "Manutenção",
            allocation: selectedService.machine,
            createdAt: new Date().toISOString(),
            createdBy: currentOperator.name,
          });

          toast({ title: `Baixa de ${qtyToDeduct} ${mockInventory[itemIndex].unit} de ${mockInventory[itemIndex].name} realizada com sucesso.` });
        } else {
          toast({ title: `Estoque insuficiente para ${mockInventory[itemIndex].name}.`, variant: "destructive" });
          return;
        }
      } else {
        toast({ title: `Código de peça ${morningLogData.partCode} não encontrado no estoque.`, variant: "destructive" });
        return;
      }
    }

    const srv = mockServices.find(s => s.id === selectedService.id) as any;
    if (srv) {
      if (!srv.dailyLogs) srv.dailyLogs = [];
      let todayLog = srv.dailyLogs.find((l: any) => l.date === morningLogData.date && l.machine === morningLogData.machine);
      if (!todayLog) {
        todayLog = { date: morningLogData.date, machine: morningLogData.machine };
        srv.dailyLogs.push(todayLog);
      }
      todayLog.initialHorimeter = Number(morningLogData.initialHorimeter);
      todayLog.serviceType = morningLogData.serviceType;
      todayLog.maintenance = morningLogData.maintenance;
      todayLog.partCode = morningLogData.partCode;
      todayLog.partQuantity = Number(morningLogData.partQuantity) || 0;
      todayLog.notes = morningLogData.notes;
      
      if (morningLogData.serviceType) {
        srv.serviceType = morningLogData.serviceType;
      }
    }

    toast({ title: "Registro da manhã salvo com sucesso" });
    setViewMode("home");
    setSelectedService(null);
    setMorningLogData({
      date: new Date().toISOString().split('T')[0],
      machine: "",
      initialHorimeter: "",
      serviceType: "",
      maintenance: "",
      partCode: "",
      partQuantity: "",
      notes: ""
    });
  };

  const saveAfternoonLog = () => {
    if (!afternoonLogData.finalHorimeter) {
      toast({ title: "Preencha o horímetro final", variant: "destructive" });
      return;
    }

    const srv = mockServices.find(s => s.id === selectedService.id) as any;
    if (srv) {
      if (!srv.dailyLogs) srv.dailyLogs = [];
      let todayLog = srv.dailyLogs.find((l: any) => l.date === afternoonLogData.date && l.machine === afternoonLogData.machine);
      if (!todayLog) {
        todayLog = { date: afternoonLogData.date, machine: afternoonLogData.machine };
        srv.dailyLogs.push(todayLog);
      }
      
      todayLog.finalHorimeter = Number(afternoonLogData.finalHorimeter);
      
      const currentDiesel = Number(afternoonLogData.diesel) || 0;
      todayLog.diesel = currentDiesel;
      todayLog.dieselSupplier = afternoonLogData.dieselSupplier;

      srv.diesel = (srv.diesel || 0) + currentDiesel;
      
      if (todayLog.initialHorimeter && todayLog.finalHorimeter) {
         const worked = todayLog.finalHorimeter - todayLog.initialHorimeter;
         if (worked > 0) {
           // Simple aggregation for now
           srv.hours = (srv.hours || 0) + worked;
         }
      }
    }

    toast({ title: "Registro da tarde salvo com sucesso" });
    setViewMode("home");
    setSelectedService(null);
    setAfternoonLogData({
      date: new Date().toISOString().split('T')[0],
      machine: "",
      finalHorimeter: "",
      diesel: "",
      dieselSupplier: "cliente",
    });
  };

  const finishService = () => {
    if (!finishServiceData.horimeter) {
      toast({ title: "Preencha o horímetro final", variant: "destructive" });
      return;
    }

    const srv = mockServices.find(s => s.id === selectedService.id);
    if (srv) {
      // For multi-machine, just complete the specific machine
      const mAssignment = srv.machines?.find(m => m.machineName === finishServiceData.machine);
      if (mAssignment) {
        mAssignment.status = "concluido";
        mAssignment.horaFinal = Number(finishServiceData.horimeter);
        if (mAssignment.horaInicial && !mAssignment.hours) {
          mAssignment.hours = mAssignment.horaFinal - mAssignment.horaInicial;
        }
        
        // If all machines are completed, complete the service
        if (srv.machines?.every(m => m.status === "concluido")) {
          srv.status = "concluido";
        } else {
          srv.status = "parcialmente_concluido";
        }
      } else {
        srv.status = "concluido";
        srv.hora_final = Number(finishServiceData.horimeter);
        if (srv.hora_inicial && !srv.hours) {
           srv.hours = srv.hora_final - srv.hora_inicial;
        }
      }
    }

    setActiveServices(activeServices.filter(s => s.id !== selectedService.id));
    toast({ title: "Serviço Finalizado" });
    setViewMode("home");
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 overflow-hidden rounded-full bg-white/20 flex items-center justify-center font-bold">
            O
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">{currentOperator.name}</span>
            <span className="text-[10px] text-white/70 uppercase tracking-wider">Portal do Operador</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white/80 hover:text-white hover:bg-white/10">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col gap-4 overflow-y-auto pb-24">
        {viewMode === "home" && (
          <div className="space-y-6 animate-in fade-in">
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" /> Serviços Ativos
              </h2>
              {activeServices.length === 0 ? (
                <div className="text-center p-6 bg-white rounded-2xl border border-border shadow-sm">
                  <p className="text-muted-foreground text-sm">Nenhum serviço ativo no momento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeServices.map(service => (
                    <Card key={service.id} className="p-4 rounded-2xl border-border shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-primary">{service.client}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Truck className="w-3 h-3" /> {service.machine}
                          </p>
                        </div>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                          {service.id}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4 mb-2">
                        <Button 
                          variant="outline" 
                          className="h-10 rounded-xl text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800" 
                          onClick={() => { setSelectedService(service); setViewMode("morning-log"); }}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Apont. Manhã
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-10 rounded-xl text-xs bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800" 
                          onClick={() => { setSelectedService(service); setViewMode("afternoon-log"); }}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Apont. Tarde
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full h-10 rounded-xl text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => { setSelectedService(service); setViewMode("finish-service"); }}
                      >
                        <StopCircle className="w-3 h-3 mr-2" />
                        Finalizar Serviço
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <Button 
              className="w-full h-14 rounded-2xl font-bold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90"
              onClick={() => setViewMode("new-service")}
            >
              <Play className="w-5 h-5 mr-2" />
              Iniciar Novo Serviço
            </Button>
          </div>
        )}

        {viewMode === "new-service" && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="flex items-center mb-4">
              <Button variant="ghost" size="sm" onClick={() => setViewMode("home")} className="-ml-2">← Voltar</Button>
              <h2 className="text-lg font-bold ml-2">Iniciar Serviço</h2>
            </div>
            
            <Card className="p-4 rounded-2xl space-y-4 shadow-sm border-border">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select onValueChange={(v) => setNewServiceData({...newServiceData, client: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {mockClients.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Máquina (Vinculadas a você) *</Label>
                <Select onValueChange={(v) => setNewServiceData({...newServiceData, machine: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50"><SelectValue placeholder="Selecione a máquina" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {currentOperator.machine_assigned.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Input type="date" value={newServiceData.date} onChange={e => setNewServiceData({...newServiceData, date: e.target.value})} className="h-12 rounded-xl bg-muted/50" />
              </div>

              <div className="space-y-2">
                <Label>Horímetro Inicial (do serviço) *</Label>
                <Input type="number" placeholder="Ex: 1250.5" value={newServiceData.horimeter} onChange={e => setNewServiceData({...newServiceData, horimeter: e.target.value})} className="h-12 rounded-xl bg-muted/50 font-mono" />
              </div>

              <div className="space-y-2">
                <Label>Foto do Horímetro *</Label>
                <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl bg-muted/30 cursor-pointer">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Tirar foto / Galeria</span>
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 rounded-xl font-bold mt-4" onClick={startNewService}>Confirmar Início</Button>
            </Card>
          </div>
        )}

        {viewMode === "morning-log" && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="flex items-center mb-2">
              <Button variant="ghost" size="sm" onClick={() => setViewMode("home")} className="-ml-2">← Voltar</Button>
              <h2 className="text-lg font-bold ml-2 text-amber-600">Apontamento da Manhã</h2>
            </div>
            
            <p className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mb-2">
              {selectedService?.client} — {selectedService?.machine}
            </p>

            <Card className="p-4 rounded-2xl space-y-4 shadow-sm border-border">
              <div className="space-y-2">
                <Label>Data do Registro *</Label>
                <Input type="date" value={morningLogData.date} onChange={e => setMorningLogData({...morningLogData, date: e.target.value})} className="h-12 rounded-xl bg-muted/50" />
              </div>
              
              <div className="space-y-2">
                <Label>Máquina Operada *</Label>
                <Select value={morningLogData.machine} onValueChange={(v) => setMorningLogData({...morningLogData, machine: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50"><SelectValue placeholder="Selecione a máquina" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {selectedService?.machines?.filter((m:any) => m.operatorName === currentOperator.name).map((m:any) => (
                      <SelectItem key={m.machineName} value={m.machineName}>{m.machineName}</SelectItem>
                    ))}
                    {!selectedService?.machines && <SelectItem value={selectedService?.machine || ""}>{selectedService?.machine}</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Horímetro Inicial (Início do Dia) *</Label>
                <Input type="number" value={morningLogData.initialHorimeter} onChange={e => setMorningLogData({...morningLogData, initialHorimeter: e.target.value})} className="h-12 rounded-xl bg-muted/50 font-mono" placeholder="Ex: 1250.5" />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Serviço / Atividade Opcional</Label>
                <Input value={morningLogData.serviceType} onChange={e => setMorningLogData({...morningLogData, serviceType: e.target.value})} className="h-12 rounded-xl bg-muted/50" placeholder="Ex: Terraplanagem, Curva de nível..." />
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-bold text-muted-foreground mb-3">Revisão e Manutenção</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Aconteceu alguma coisa? O que foi feito?</Label>
                    <Input value={morningLogData.notes} onChange={e => setMorningLogData({...morningLogData, notes: e.target.value})} className="h-12 rounded-xl bg-muted/50" placeholder="Ex: Pneu furado, fio solto, revisão OK" />
                  </div>

                  <div className="space-y-2">
                    <Label>Manutenção / Troca (Opcional)</Label>
                    <Input value={morningLogData.maintenance} onChange={e => setMorningLogData({...morningLogData, maintenance: e.target.value})} className="h-12 rounded-xl bg-muted/50" placeholder="Ex: Troca de óleo do motor" />
                  </div>

                  {morningLogData.maintenance && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <div className="space-y-2">
                        <Label>Cód. Peça/Filtro</Label>
                        <Input value={morningLogData.partCode} onChange={e => setMorningLogData({...morningLogData, partCode: e.target.value})} className="h-10 rounded-lg bg-white" placeholder="F-123" />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantidade</Label>
                        <Input type="number" value={morningLogData.partQuantity} onChange={e => setMorningLogData({...morningLogData, partQuantity: e.target.value})} className="h-10 rounded-lg bg-white" placeholder="Ex: 2" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button className="w-full h-12 rounded-xl font-bold mt-2 bg-amber-500 hover:bg-amber-600 text-white" onClick={saveMorningLog}>Salvar Manhã</Button>
            </Card>
          </div>
        )}

        {viewMode === "afternoon-log" && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="flex items-center mb-2">
              <Button variant="ghost" size="sm" onClick={() => setViewMode("home")} className="-ml-2">← Voltar</Button>
              <h2 className="text-lg font-bold ml-2 text-indigo-600">Apontamento da Tarde</h2>
            </div>
            
            <p className="text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg mb-2">
              {selectedService?.client} — {selectedService?.machine}
            </p>

            <Card className="p-4 rounded-2xl space-y-4 shadow-sm border-border">
              <div className="space-y-2">
                <Label>Data do Registro *</Label>
                <Input type="date" value={afternoonLogData.date} onChange={e => setAfternoonLogData({...afternoonLogData, date: e.target.value})} className="h-12 rounded-xl bg-muted/50" />
              </div>

              <div className="space-y-2">
                <Label>Máquina Operada *</Label>
                <Select value={afternoonLogData.machine} onValueChange={(v) => setAfternoonLogData({...afternoonLogData, machine: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50"><SelectValue placeholder="Selecione a máquina" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {selectedService?.machines?.filter((m:any) => m.operatorName === currentOperator.name).map((m:any) => (
                      <SelectItem key={m.machineName} value={m.machineName}>{m.machineName}</SelectItem>
                    ))}
                    {!selectedService?.machines && <SelectItem value={selectedService?.machine || ""}>{selectedService?.machine}</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Horímetro Final (Fim do Dia) *</Label>
                <Input type="number" value={afternoonLogData.finalHorimeter} onChange={e => setAfternoonLogData({...afternoonLogData, finalHorimeter: e.target.value})} className="h-12 rounded-xl bg-muted/50 font-mono" placeholder="Ex: 1259.0" />
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-bold text-muted-foreground mb-3">Abastecimento</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Diesel (Litros)</Label>
                    <Input type="number" value={afternoonLogData.diesel} onChange={e => setAfternoonLogData({...afternoonLogData, diesel: e.target.value})} className="h-12 rounded-xl bg-muted/50" placeholder="Ex: 100" />
                  </div>
                  {afternoonLogData.diesel && (
                    <div className="space-y-2">
                      <Label>Fornecedor</Label>
                      <Select value={afternoonLogData.dieselSupplier} onValueChange={v => setAfternoonLogData({...afternoonLogData, dieselSupplier: v})}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/50"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="cliente">Cliente</SelectItem>
                          <SelectItem value="empresa">Empresa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <Button className="w-full h-12 rounded-xl font-bold mt-2 bg-indigo-500 hover:bg-indigo-600 text-white" onClick={saveAfternoonLog}>Salvar Tarde</Button>
            </Card>
          </div>
        )}

        {viewMode === "finish-service" && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="flex items-center mb-4">
              <Button variant="ghost" size="sm" onClick={() => setViewMode("home")} className="-ml-2">← Voltar</Button>
              <h2 className="text-lg font-bold ml-2 text-destructive">Finalizar Serviço</h2>
            </div>

            <Card className="p-4 rounded-2xl space-y-4 shadow-sm border-destructive/20 bg-destructive/5">
              <div className="space-y-2">
                <Label>Data de Finalização *</Label>
                <Input type="date" value={finishServiceData.date} onChange={e => setFinishServiceData({...finishServiceData, date: e.target.value})} className="h-12 rounded-xl bg-white" />
              </div>

              <div className="space-y-2">
                <Label>Máquina a Finalizar *</Label>
                <Select value={finishServiceData.machine} onValueChange={(v) => setFinishServiceData({...finishServiceData, machine: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue placeholder="Selecione a máquina" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {selectedService?.machines?.filter((m:any) => m.operatorName === currentOperator.name && m.status !== "concluido").map((m:any) => (
                      <SelectItem key={m.machineName} value={m.machineName}>{m.machineName}</SelectItem>
                    ))}
                    {!selectedService?.machines && <SelectItem value={selectedService?.machine || ""}>{selectedService?.machine}</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Horímetro Final (do serviço) *</Label>
                <Input type="number" placeholder="Ex: 1350.0" value={finishServiceData.horimeter} onChange={e => setFinishServiceData({...finishServiceData, horimeter: e.target.value})} className="h-12 rounded-xl bg-white font-mono" />
              </div>

              <div className="space-y-2">
                <Label>Foto do Horímetro *</Label>
                <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-destructive/30 rounded-xl bg-white cursor-pointer">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Camera className="w-6 h-6 mb-1 text-destructive/60" />
                    <span className="text-xs font-medium">Tirar foto / Galeria</span>
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 rounded-xl font-bold mt-4" variant="destructive" onClick={finishService}>Confirmar Finalização</Button>
            </Card>
          </div>
        )}
        
        {viewMode === "reports" && (
          <ReportsView activeServices={activeServices} currentOperator={currentOperator} onBack={() => setViewMode("home")} />
        )}
      </main>

      {/* Bottom Nav */}
      <div className="bg-white border-t border-border p-3 flex justify-around items-center fixed bottom-0 w-full max-w-lg mx-auto left-1/2 -translate-x-1/2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-50 rounded-t-3xl pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <button 
          onClick={() => setViewMode("home")} 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${viewMode !== "reports" ? "text-primary" : "text-muted-foreground"}`}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Serviços</span>
        </button>
        <button 
          onClick={() => setViewMode("reports")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${viewMode === "reports" ? "text-primary" : "text-muted-foreground"}`}
        >
          <Clock className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Minhas Horas</span>
        </button>
      </div>
    </div>
  );
}
