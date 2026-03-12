import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, LogOut, Settings, Clock, User, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Profile() {
  const activities = [
    { action: "Exportou Relatório de Rentabilidade", date: "Hoje, 14:30" },
    { action: "Criou novo serviço: SRV-1065", date: "Ontem, 09:15" },
    { action: "Aprovou Pagamento Diesel - R$ 1.500,00", date: "22 Out, 16:45" },
    { action: "Atualizou máquina: Escavadeira 220", date: "20 Out, 11:20" },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie suas configurações e atividades recentes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border text-destructive hover:bg-destructive/10 rounded-xl h-10 px-5 shadow-sm transition-all hidden sm:flex active:scale-95">
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border rounded-2xl shadow-sm md:col-span-1 h-fit">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/10">
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold font-display">AS</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold font-display">Admin Silva</h2>
            <div className="flex items-center text-muted-foreground mt-1 text-sm gap-1">
              <Shield className="w-4 h-4 text-primary" />
              <span>Administrador do Sistema</span>
            </div>
            
            <div className="w-full mt-6 space-y-3">
              <Button variant="secondary" className="w-full justify-start rounded-xl h-11">
                <User className="w-4 h-4 mr-3 text-muted-foreground" />
                Dados Pessoais
              </Button>
              <Button variant="secondary" className="w-full justify-start rounded-xl h-11">
                <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
                Configurações da Empresa
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-border rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-display">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <div key={i} className="flex gap-4 items-start pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-display">Últimas Exportações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-border bg-card rounded-xl p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors touch-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] rounded-xl">
                        <FileDown className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Relatório Mensal_Out.pdf</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">Ontem</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full">
                      <FileDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" className="w-full border-border text-destructive hover:bg-destructive/10 rounded-xl h-12 shadow-sm transition-all sm:hidden active:scale-95">
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}