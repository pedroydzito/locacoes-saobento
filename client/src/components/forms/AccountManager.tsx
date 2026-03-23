import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockAccounts, mockTransactions } from "@/lib/mock-data";
import { Trash2, Edit2, Check, X, Plus } from "lucide-react";

interface AccountManagerProps {
  onChanged: () => void;
}

export function AccountManager({ onChanged }: AccountManagerProps) {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [newAccountName, setNewAccountName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const getTransactionCount = (accountName: string) => {
    return mockTransactions.filter(tx => tx.account === accountName).length;
  };

  const syncAccounts = (newAccs: typeof mockAccounts) => {
    setAccounts(newAccs);
    // Mutate the mock array in memory
    mockAccounts.length = 0;
    mockAccounts.push(...newAccs);
    onChanged();
  };

  const handleAdd = () => {
    if (!newAccountName.trim()) return;
    const name = newAccountName.trim();
    if (accounts.some(a => a.name.toLowerCase() === name.toLowerCase())) {
      alert("Conta já existe!");
      return;
    }

    const newAcc = {
      id: `acc-${Date.now()}`,
      name,
      isDefault: false
    };

    syncAccounts([...accounts, newAcc]);
    setNewAccountName("");
  };

  const handleDelete = (id: string, name: string) => {
    const count = getTransactionCount(name);
    if (count > 0) {
      alert(`Não é possível excluir esta conta pois ela possui ${count} transações vinculadas.`);
      return;
    }
    syncAccounts(accounts.filter(a => a.id !== id));
  };

  const handleStartEdit = (acc: typeof mockAccounts[0]) => {
    setEditingId(acc.id);
    setEditName(acc.name);
  };

  const handleSaveEdit = (acc: typeof mockAccounts[0]) => {
    if (!editName.trim() || editName.trim() === acc.name) {
      setEditingId(null);
      return;
    }
    const name = editName.trim();
    if (accounts.some(a => a.id !== acc.id && a.name.toLowerCase() === name.toLowerCase())) {
      alert("Já existe uma conta com este nome!");
      return;
    }

    // Update transactions that used the old name
    mockTransactions.forEach(tx => {
      if (tx.account === acc.name) {
        tx.account = name;
      }
    });

    syncAccounts(accounts.map(a => a.id === acc.id ? { ...a, name } : a));
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-2 pb-4 border-b border-border/50">
        <div className="space-y-2 flex-1">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nova Conta</Label>
          <Input 
            value={newAccountName} 
            onChange={e => setNewAccountName(e.target.value)} 
            placeholder="Ex: Nubank, Sicredi..." 
            className="h-10 rounded-xl" 
          />
        </div>
        <Button onClick={handleAdd} className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
        {accounts.map(acc => {
          const txCount = getTransactionCount(acc.name);
          const isEditing = editingId === acc.id;

          return (
            <div key={acc.id} className="flex items-center justify-between p-3.5 border border-border bg-card rounded-xl shadow-sm transition-all hover:border-[hsl(var(--primary)/0.3)]">
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <Input 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className="h-9 focus-visible:ring-1" 
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(acc)} className="h-9 w-9 text-[hsl(var(--success-text))] hover:bg-[hsl(var(--success-subtle))] hover:text-[hsl(var(--success-text))]">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-9 w-9 text-muted-foreground hover:bg-muted">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm truncate">{acc.name}</span>
                      {acc.isDefault && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">Padrão</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{txCount} transaç{txCount === 1 ? 'ão' : 'ões'}</p>
                  </div>
                  
                  {!acc.isDefault && (
                    <div className="flex items-center gap-1 ml-4">
                      <Button size="icon" variant="ghost" onClick={() => handleStartEdit(acc)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDelete(acc.id, acc.name)} 
                        disabled={txCount > 0}
                        className={`h-8 w-8 ${txCount > 0 ? 'opacity-30' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
