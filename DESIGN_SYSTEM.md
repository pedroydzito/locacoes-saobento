# Design System — Locações São Bento
**Versão 1.4.5 · Guia Mestre Definitivo · Março 2026**

---

## 1. Visão Geral

O Design System da Locações São Bento é a única fonte de verdade para a interface do ecossistema ERP. Ele garante consistência total, padroniza componentes reutilizáveis e define as regras de escala para contextos Desktop e Mobile. Este documento foi projetado para ser portável: ao alterar os tokens de cores básicos, todo o sistema deve se adaptar automaticamente.

**Princípios de design:**
- **Simplicidade Premium** — Clean UI com foco em dados críticos e remoção de ruído visual.
- **Mobile-First Nativo** — O mobile possui identidade própria (Bottom Nav, FABs, Sheets), não sendo apenas um desktop reduzido.
- **Tokens como Lei** — Nenhuma cor, espaçamento ou fonte deve ser hardcoded. Tudo deve derivar de variáveis CSS.
- **Alinhamento de Luxo** — Descrições de página alinhadas perfeitamente com os ícones de contexto horizontais.

---

## 2. Paleta de Cores (Tokens)

As cores são definidas exclusivamente como variáveis CSS em `src/index.css`. **Proibido** o uso de classes Tailwind hardcoded (ex: `text-blue-600`) para elementos estruturais.

### 2.1 Cores de Marca

| Token | Valor (HSL) | Uso |
|---|---|---|
| `--primary` | 209 52% 29% | Azul Saque — Ações principais, ícones de cabeçalho, logo |
| `--primary-foreground` | 0 0% 98% | Texto sobre fundo primary |
| `--secondary` | 204 43% 45% | Azul Médio — Destaque secundário, ícones informativos |
| `--accent` | 46 88% 52% | Amarelo/Ouro — Detalhes da marca São Bento, status OS |

### 2.3 Cores Semânticas (Status & Tags)

Deverão ser usadas exclusivamente via variáveis para garantir portabilidade entre sistemas.

```css
/* Sucesso (lucro, concluído, ativo) */
--success:        142 71% 45%;
--success-subtle: 142 71% 95%;
--success-text:   142 76% 25%;

/* Aviso (pendente, atenção, manutenção) */
--warning:        38 92% 50%;
--warning-subtle: 38 92% 95%;
--warning-text:   38 76% 34%;

/* Informação (neutro, transporte, info) */
--info:           217 91% 60%;
--info-subtle:    217 91% 95%;
--info-text:      217 79% 40%;

/* Neutral Tags (categorização, pílulas neutras) */
--neutral:         210 10% 90%;
--neutral-subtle:  210 10% 96%; /* ex: #F1F3F5 */
--neutral-text:    210 10% 30%; /* ex: #495057 */
```

### 2.4 Cores de Interface (Névoa / Base)

| Token | Valor | Uso |
|---|---|---|
| `--background` | 60 9% 96% | Fundo bege claro (Bege Arenoso) |
| `--card` | 0 0% 100% | Fundo de cards, modais e containers brancos |
| `--border` | 214 32% 91% | Bordas de cards e inputs |
| `--muted-foreground` | 215 16% 47% | Texto secundário e descrições |
| `--destructive` | 0 72% 51% | Erros, prejuízo e exclusão |

---

## 3. Tipografia

### 3.1 Fontes
- **Família Unificada:** `DM Sans`, sans-serif (Usada para Display e Sans).
- **Código/Técnico:** `JetBrains Mono`, monospace (Volumes, Placas).

### 3.2 Escala (Classes Utilitárias)
- **H1 (Título Página):** `text-3xl font-bold font-display tracking-tight` (30px).
- **H2 (Seção/Card):** `text-xl font-bold font-display` (20px).
- **Body Bold:** `text-sm font-bold`.
- **Label / Column:** `text-xs font-bold text-muted-foreground uppercase tracking-wide`.

---

## 4. Spacing & Branding

### 4.1 Raios de Borda
- **Cards:** `rounded-2xl` (16px).
- **Buttons/Inputs:** `rounded-xl` (12px).
- **Badges/Pills:** `rounded-full` (9999px).

### 4.2 Sombras e Efeitos
- **Login/Auth:** Gradiente 160deg com textura de fundo (hatching 4% opacidade).
- **KPI Cards:** Background `primary/10` para o container do ícone.
- **Charts:** Stroke Width 3px, Gradients de 20% a 0% opacidade.

---

## 5. Componentes de Sistema

### 5.1 Botões
- **Desktop:** Altura `h-10`.
- **Mobile Forms:** Altura `h-12 w-full font-bold`.
- **Estilo Outline:** Fundo `bg-white`, borda `border-border`.

### 5.2 FAB (Floating Action Button)
- **Uso:** Ação principal de adição no mobile.
- **Posição:** `bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4`.
- **Estilo:** `w-14 h-14 bg-primary text-white rounded-full shadow-lg`.

### 5.3 Badges (Status & Pills)
- **Pill Neutra (Categorias):** `bg-neutral-subtle text-neutral-text rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider`. Usada para tipos de máquinas, máquinas alocadas e categorias financeiras.
- **Status Badge:** `bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]`.

### 5.4 Cards Mobile
Utilizar classe `touch-card` para feedback tátil (`active:scale-[0.98]`).
```tsx
<div className="bg-card rounded-2xl border p-4 touch-card">
  {/* Flex row, Título truncado, Metadado small */}
</div>
```

---

## 6. Navegação

### 6.1 Sidebar (Desktop)
- **Header Structure:** Layout horizontal (flex row). Redução de altura para `h-20`.
- **Logo:** Alinhada à esquerda (`w-10 h-10`).
- **Marca:** 
    - "Locações": Sem itálico/uppercase, tamanho `text-[10px]`.
    - "São Bento": Fonte Display em destaque no centro.
    - "Logística": Subtexto em cinza (`white/30`), tamanho `text-[10px]`.
- **Toggle:** Botão de controle posicionado à **Direita** do header (ml-auto).
- **Active State:** Ícone em Branco Puro sobre fundo primário.

### 6.2 Bottom Nav (Mobile)
- **Fundo:** `bg-white` com `pb-safe`.
- **Tab Ativa:** Estilo pílula `bg-primary/12 text-primary rounded-2xl h-[3.5rem]`.

### 6.3 Cabeçalhos (Headers)
**Padrão de Alinhamento Luxo:**
O ícone de contexto fica à esquerda do título (Exceção: **Visão Operacional/Início** não utiliza ícone). A descrição deve estar fora do container do título, alinhada horizontalmente com o **início do ícone** (ou título na ausência de ícone).
```html
<div class="flex flex-col">
  <div class="flex items-center gap-3">
    <!-- Icon hidden on Welcome/Start -->
    <Icon class="text-primary h-7 w-7" />
    <h1 class="font-display">Título</h1>
  </div>
  <p class="text-muted-foreground">Descrição alinhada ao elemento inicial</p>
</div>
```

---

## 7. Autenticação (Login)

### 7.1 UX de Entrada Progressiva
- **Foco:** Priorizar login social (Google).
- **Acordeão:** O formulário de e-mail e senha deve ser oculto por padrão, acessível via botão com chevron.
- **Micro-animação:** Utilizar `Framer Motion` para transição de altura suave (`ease-in-out`).
- **Cards Internos:** O formulário colapsável deve residir em um `Card` com background `card/40` e sobra sutil.

---

## 8. Regras de Consistência (Checklist)

- [ ] **Sem Hardcoded Colors:** Usar `var(--primary)`, `var(--success)`, etc.
- [ ] **Dual View:** Desktop (Tabela) vs Mobile (Cards) sempre implementados.
- [ ] **Forms Mobile:** Abertura obrigatória via `<Sheet side="bottom">` com `rounded-t-3xl`.
- [ ] **FAB Position:** Flutuando precisamente acima da Bottom Nav.
- [ ] **Clickable Lists:** Linhas e cards inteiros devem possuir `cursor-pointer` para navegação.
- [ ] **BI Pattern:** Gráficos com tooltips arredondados (12px) e bordas sólidas.

---
*ERP Locações São Bento — Sistema Gerado em Março de 2026*
