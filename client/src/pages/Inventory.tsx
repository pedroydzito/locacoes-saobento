import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockInventory } from "@/lib/mock-data";
import { Search, Plus, Filter, MoreHorizontal, FileDown, Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InventoryForm } from "@/components/forms/InventoryForm";
import { MobileListControls } from "@/components/shared/MobileListControls";
import { MobileCard, MobileCardContent, MobileCardActions } from "@/components/shared/MobileCard";

export default function Inventory() {
  const [, setLocation] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const sortedInventory = [...mockInventory].sort((a, b) => a.name.localeCompare(b.name));

  const filteredInventory = sortedInventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      const idx = mockInventory.findIndex(i => i.id === deletingId);
      if (idx !== -1) mockInventory.splice(idx, 1);
      setDeletingId(null);
      setIsDeleteDialogOpen(false);
      setRefreshKey(k => k + 1);
    }
  };

  const handleViewDetails = (item: any) => {
    setLocation(`/estoque/${item.id}`);
  };

  const handleSave = (data: any) => {
    if (editingItem) {
      const idx = mockInventory.findIndex(i => i.id === editingItem.id);
      if (idx !== -1) mockInventory[idx] = { ...editingItem, ...data };
    } else {
      mockInventory.unshift({ id: `inv-${Date.now()}`, ...data });
    }
    setIsModalOpen(false);
    setRefreshKey(k => k + 1);
  };

  const userRole = localStorage.getItem("userRole") || "operador";

  return (
    <div className="space-y-6 pb-8" key={refreshKey}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Package className="w-7 h-7 text-primary hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Estoque <span className="text-muted-foreground font-normal ml-1">({filteredInventory.length})</span>
            </h1>
          </div>
          <p className="hidden sm:block text-sm text-muted-foreground mt-1">Controle de peças, óleos e insumos da oficina.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" className="hidden sm:flex border-border bg-white rounded-xl h-10 transition-all">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" className="hidden sm:flex border-border bg-white rounded-xl h-10 transition-all" onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={handleAdd} className="rounded-xl h-10 px-5 transition-all active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Nova Entrada
          </Button>
        </div>
      </div>

      <MobileListControls
        onExportClick={() => { }}
        onFilterClick={() => setIsFilterModalOpen(true)}
        filterLabel="Filtrar Estoque"
      />

      <Card className="border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-card">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-border bg-muted/20 rounded-xl h-10 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Tabela Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide font-bold">
                <th className="p-4">Item</th>
                <th className="p-4">Código</th>
                <th className="p-4 text-right">Qtd Atual</th>
                <th className="p-4">Unidade</th>
                <th className="p-4 text-right">Preço Un.</th>
                <th className="p-4">Status</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {filteredInventory.map((item) => {
                const isLowStock = item.quantity < item.minQuantity;
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => handleViewDetails(item)}>
                    <td className="p-4 font-bold text-foreground">{item.name}</td>
                    <td className="p-4 text-muted-foreground">{item.code}</td>
                    <td className={`p-4 text-right font-bold ${isLowStock ? "text-destructive" : "text-foreground"}`}>
                      {item.quantity}
                    </td>
                    <td className="p-4 text-muted-foreground">{item.unit}</td>
                    <td className="p-4 text-right text-muted-foreground">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-4">
                      {isLowStock ? (
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Baixo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">
                          Normal
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="group-hover:opacity-100 transition-opacity rounded-full text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(item)} className="rounded-lg cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          {userRole === 'admin' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer">
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Cards Mobile */}
        <div className="sm:hidden divide-y divide-border/60 bg-card">
          {filteredInventory.map((item) => {
            const isLowStock = item.quantity < item.minQuantity;
            return (
              <MobileCard key={item.id} onClick={() => handleViewDetails(item)}>
                <MobileCardContent
                  title={item.name}
                  subtitle={
                    <div className="mt-1 space-y-1">
                      <p className="text-[10px] text-muted-foreground">Código: {item.code}</p>
                      <div className="flex items-center gap-2">
                        {isLowStock ? (
                          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-0 text-[9px] px-1.5 py-0">
                            Estoque Baixo
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  }
                />
                <MobileCardActions>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Qtd Atual</p>
                    <p className={`font-bold text-sm ${isLowStock ? "text-destructive" : "text-primary"}`}>
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center justify-end mt-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="h-8 w-8 p-0 rounded-full">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    {userRole === 'admin' && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 rounded-full text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </MobileCardActions>
              </MobileCard>
            )
          })}
        </div>
      </Card>

      <button
        onClick={handleAdd}
        className="sm:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Editar Item" : "Nova Entrada no Estoque"}
      >
        <InventoryForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>

      <ActionModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar Estoque"
      >
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground italic">Filtros avançados serão implementados em breve.</p>
          <Button className="w-full h-12 mt-4 rounded-xl font-bold" onClick={() => setIsFilterModalOpen(false)}>
            Ok
          </Button>
        </div>
      </ActionModal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir item"
        description="Tem certeza que deseja excluir este item do estoque? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
