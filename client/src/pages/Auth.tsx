import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wheat } from "lucide-react";
import { useLocation } from "wouter";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Esquerda / Topo (Mobile) - Branding & Gradiente */}
      <div className="relative w-full md:w-5/12 lg:w-[45%] md:h-screen p-8 md:p-12 lg:p-16 flex flex-col justify-between overflow-hidden" 
           style={{ background: 'linear-gradient(160deg, hsl(103,57%,12%) 0%, hsl(103,52%,19%) 100%)' }}>
        
        {/* Textura de fundo */}
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 20L20 0H0v20z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '16px 16px' }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 md:mb-16">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-sm border border-white/20">
              <Wheat className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <span className="font-bold text-xl md:text-2xl font-display tracking-tight text-white">São Bento</span>
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-white leading-tight mb-4">
              Gestão inteligente<br />para sua operação<br />agrícola.
            </h1>
            <p className="text-white/70 text-lg max-w-sm">
              Controle de frota, horas trabalhadas, consumo de diesel e faturamento em uma única plataforma.
            </p>
          </div>
        </div>

        {/* Curva para mobile */}
        <div className="md:hidden absolute -bottom-1 left-0 right-0 h-12 bg-background" style={{ borderTopLeftRadius: '2rem', borderTopRightRadius: '2rem' }} />
      </div>

      {/* Direita / Base (Mobile) - Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background relative -mt-6 md:mt-0 z-10 rounded-t-[2rem] md:rounded-none">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl font-bold font-display text-foreground mb-2">Acesse sua conta</h2>
            <p className="text-muted-foreground text-sm">Insira suas credenciais para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">E-mail ou Usuário</Label>
              <Input 
                id="email" 
                type="text" 
                placeholder="admin@saobento.com" 
                className="h-12 md:h-11 rounded-xl bg-card border-border shadow-sm px-4" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Senha</Label>
                <a href="#" className="text-xs font-bold text-primary hover:underline">Esqueceu a senha?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-12 md:h-11 rounded-xl bg-card border-border shadow-sm px-4 font-mono text-lg tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-base" 
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 md:h-12 rounded-xl font-bold text-base mt-4 shadow-md transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar no Sistema"}
            </Button>
          </form>
          
          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2026 Fazenda São Bento. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}