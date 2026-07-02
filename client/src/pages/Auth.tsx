import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

import { mockOperators } from "@/lib/mock-data";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login and setup mock role
    setTimeout(() => {
      const operator = mockOperators.find(
        (op) => (op.username === email || op.name.toLowerCase() === email.toLowerCase()) && op.password === password
      );

      if (operator) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", "operador");
        localStorage.setItem("operatorId", operator.id);
        localStorage.setItem("operatorName", operator.name);
        setIsLoading(false);
        setLocation("/portal");
      } else if (email === "admin@saobento.com" || email === "admin" || email.toLowerCase().startsWith("admin")) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", "admin");
        setIsLoading(false);
        setLocation("/");
      } else {
        alert("Credenciais inválidas");
        setIsLoading(false);
      }
    }, 800);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "admin");
      setIsLoading(false);
      setLocation("/");
    }, 800);
  };

  const handleTestAdminLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "admin");
      setIsLoading(false);
      setLocation("/");
    }, 800);
  };

  const handleTestOperatorLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const operator = mockOperators[0];
      if (operator) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", "operador");
        localStorage.setItem("operatorId", operator.id);
        localStorage.setItem("operatorName", operator.name);
      }
      setIsLoading(false);
      setLocation("/portal");
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Esquerda / Topo (Mobile) - Branding & Gradiente */}
      <div className="relative w-full md:w-5/12 lg:w-[45%] md:h-screen p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center text-center overflow-hidden bg-primary" 
           style={{ 
             backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 10px, transparent 10px, transparent 20px)',
             backgroundColor: 'hsl(var(--primary))'
           }}>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 w-32 h-32 md:w-40 md:h-40 overflow-hidden relative flex-shrink-0">
             <img src="/logo-branca2.svg" alt="Logo São Bento Locações" className="w-full h-full object-contain" />
          </div>
          
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-white leading-tight mb-4">
              São Bento <span className="text-white">Locações</span>
            </h1>
            <p className="text-white/80 text-base max-w-xs mx-auto font-medium">
              Gestão inteligente de frota e serviços.
            </p>
            <div className="w-8 h-1 bg-[#f1c40f] mx-auto mt-6 rounded-full" />
          </div>
        </div>

        {/* Curva para mobile */}
        <div className="md:hidden absolute -bottom-1 left-0 right-0 h-12 bg-background" style={{ borderTopLeftRadius: '2rem', borderTopRightRadius: '2rem' }} />
      </div>

      {/* Direita / Base (Mobile) - Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background relative -mt-6 md:mt-0 z-10 rounded-t-[2rem] md:rounded-none">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold font-display text-foreground mb-2">Bem-vindo de volta</h2>
            <p className="text-muted-foreground text-sm">Acesse o sistema de gestão da fazenda.</p>
          </div>

          <div className="space-y-6">
            <Button 
              type="button"
              onClick={handleGoogleLogin}
              variant="outline" 
              className="w-full h-12 rounded-xl font-bold text-sm bg-card border-border  flex items-center justify-center gap-3 hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar com Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground uppercase tracking-wider font-bold">ou</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="w-full h-12 rounded-xl font-bold text-sm bg-card border-border  flex items-center justify-center gap-2 hover:bg-muted transition-all"
              >
                Entrar com e-mail e senha
                {showEmailForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              <AnimatePresence>
                {showEmailForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <Card className="border-border  rounded-2xl p-6 mt-2 bg-card/40">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Usuário / E-mail</Label>
                          <Input
                            id="email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@saobento.com ou operador..."
                            className="h-12 rounded-xl bg-card border-border  px-4"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Senha</Label>
                            <a href="#" className="text-xs font-bold text-primary hover:underline">Esqueceu?</a>
                          </div>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-12 rounded-xl bg-card border-border  px-4 font-mono text-lg tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-base"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 rounded-xl font-bold text-base mt-2  transition-all active:scale-[0.98]"
                          disabled={isLoading}
                        >
                          {isLoading ? "Entrando..." : "Entrar"}
                        </Button>
                      </form>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Início: Botões de Teste */}
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border border-dashed"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground uppercase tracking-wider font-bold">Acesso Rápido (Teste)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button 
                type="button"
                variant="secondary"
                onClick={handleTestAdminLogin}
                className="w-full h-10 text-xs font-bold border border-border bg-card hover:bg-muted"
                disabled={isLoading}
              >
                Entrar como Admin
              </Button>
              <Button 
                type="button"
                variant="secondary"
                onClick={handleTestOperatorLogin}
                className="w-full h-10 text-xs font-bold border border-border bg-card hover:bg-muted"
                disabled={isLoading}
              >
                Entrar como Operador
              </Button>
            </div>
            {/* Fim: Botões de Teste */}
            
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Ainda não tem acesso? <a href="#" className="font-bold text-[hsl(var(--primary))] hover:underline">Solicitar cadastro</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}