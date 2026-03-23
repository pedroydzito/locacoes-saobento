import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

function isValidCPF(cpf: string) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0, rest;
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  if (rest !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  if (rest !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

function isValidCNPJ(cnpj: string) {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0, pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== Number(digits.charAt(0))) return false;
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== Number(digits.charAt(1))) return false;
  return true;
}

function validateCPFOrCNPJ(val: string) {
  const clean = val.replace(/[^\d]/g, '');
  if (clean.length === 11) return isValidCPF(clean);
  if (clean.length === 14) return isValidCNPJ(clean);
  return false;
}

const clientSchema = z.object({
  name: z.string().min(2, "Obrigatório"),
  cpf_cnpj: z.string().min(11, "Obrigatório").refine((val) => validateCPFOrCNPJ(val), {
    message: "CPF/CNPJ inválido",
  }),
  phone: z.string().min(10, "Obrigatório"),
  email: z.string().email("E-mail inválido"),
  city: z.string().min(2, "Obrigatório"),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function ClientForm({ onSave, onCancel, initialData }: ClientFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
       name: initialData?.name || "",
       cpf_cnpj: initialData?.cpf_cnpj || "",
       phone: initialData?.phone || "",
       email: initialData?.email || "",
       city: initialData?.city || "",
       notes: initialData?.notes || "",
    }
  });

  const onSubmit = (data: ClientFormData) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome / Empresa *</Label>
        <Input id="name" {...register("name")} placeholder="Nome do cliente" className="h-11 sm:h-10 rounded-xl" />
        {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cpf_cnpj" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">CPF ou CNPJ *</Label>
          <Input id="cpf_cnpj" {...register("cpf_cnpj")} placeholder="Apenas números" className="h-11 sm:h-10 rounded-xl font-mono" />
          {errors.cpf_cnpj && <p className="text-xs text-destructive font-medium">{errors.cpf_cnpj.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">E-mail *</Label>
          <Input id="email" type="email" {...register("email")} placeholder="E-mail" className="h-11 sm:h-10 rounded-xl" />
          {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Telefone *</Label>
          <Input id="phone" {...register("phone")} placeholder="(00) 00000-0000" className="h-11 sm:h-10 rounded-xl font-mono" />
          {errors.phone && <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cidade *</Label>
          <Input id="city" {...register("city")} placeholder="Cidade" className="h-11 sm:h-10 rounded-xl" />
          {errors.city && <p className="text-xs text-destructive font-medium">{errors.city.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Observações</Label>
        <Textarea id="notes" {...register("notes")} placeholder="Informações adicionais..." rows={3} className="rounded-xl resize-none" />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sm:mt-6 pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 sm:h-10 rounded-xl flex-1 sm:flex-none">Cancelar</Button>
        <Button type="submit" className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">{initialData ? 'Atualizar' : 'Salvar'}</Button>
      </div>
    </form>
  );
}