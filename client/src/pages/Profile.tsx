import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, LogOut, Settings, Clock, User, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas configurações e atividades recentes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border/50 text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-sm md:col-span-1 h-fit">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/10">
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">AD</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">Admin Silva</h2>
            <div className="flex items-center text-muted-foreground mt-1 text-sm gap-1">
              <Shield className="w-4 h-4" />
              <span>Administrador do Sistema</span>
            </div>
            
            <div className="w-full mt-6 space-y-3">
              <Button variant="secondary" className="w-full justify-start">
                <User className="w-4 h-4 mr-3" />
                Dados Pessoais
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-3" />
                Configurações da Empresa
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <div key={i} className="flex gap-4 items-start pb-4 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Últimas Exportações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-border/50 rounded-lg p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-md">
                        <FileDown className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Relatório Mensal_Out.pdf</p>
                        <p className="text-xs text-muted-foreground">Ontem</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <FileDown className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}