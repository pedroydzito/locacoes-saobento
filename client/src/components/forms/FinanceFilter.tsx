import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAccounts } from "@/lib/mock-data";

export interface FinanceFilters {
  category: string;
  account: string;
  startDate: string;
  endDate: string;
}

interface FinanceFilterProps {
  filters: FinanceFilters;
  onApply: (filters: FinanceFilters) => void;
  onClear: () => void;
  onClose: () => void;
}

export function FinanceFilter({ filters, onApply, onClear, onClose }: FinanceFilterProps) {
  const [localFilters, setLocalFilters] = useState<FinanceFilters>(filters);

  const handleApplyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setLocalFilters(prev => ({
      ...prev,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }));
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setLocalFilters(prev => ({
      ...prev,
      startDate: today,
      endDate: today
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Filtros Rápidos (Período)</Label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={setToday} className="rounded-xl h-8">Hoje</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleApplyPreset(7)} className="rounded-xl h-8">7 dias</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleApplyPreset(15)} className="rounded-xl h-8">15 dias</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleApplyPreset(30)} className="rounded-xl h-8">30 dias</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleApplyPreset(90)} className="rounded-xl h-8">90 dias</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Data Inicial</Label>
          <Input 
            type="date" 
            value={localFilters.startDate} 
            onChange={e => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="h-11 sm:h-10 rounded-xl font-mono" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Data Final</Label>
          <Input 
            type="date" 
            value={localFilters.endDate} 
            onChange={e => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="h-11 sm:h-10 rounded-xl font-mono" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Categoria</Label>
        <Input 
          placeholder="Ex: Diesel, Serviços..." 
          value={localFilters.category}
          onChange={e => setLocalFilters(prev => ({ ...prev, category: e.target.value }))}
          className="h-11 sm:h-10 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Conta</Label>
        <Select 
          value={localFilters.account} 
          onValueChange={value => setLocalFilters(prev => ({ ...prev, account: value }))}
        >
          <SelectTrigger className="h-11 sm:h-10 rounded-xl">
            <SelectValue placeholder="Todas as contas" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Todas as contas</SelectItem>
            {mockAccounts.map(acc => (
              <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border/50">
        <Button variant="ghost" onClick={() => {
          setLocalFilters({ category: "", account: "all", startDate: "", endDate: "" });
          onClear();
          onClose();
        }} className="h-12 sm:h-10 rounded-xl flex-1 sm:flex-none">Limpar Filtros</Button>
        <Button onClick={() => {
          onApply(localFilters);
          onClose();
        }} className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">Aplicar Filtros</Button>
      </div>
    </div>
  );
}
