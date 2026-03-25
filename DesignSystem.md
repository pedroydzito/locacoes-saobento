# Design System - Locações São Bento

Este documento centraliza as diretrizes visuais e técnicas do sistema.

## Cores e Tema (Tailwind CSS v4)

O projeto utiliza o **Tailwind CSS v4**. Todas as cores são definidas como variáveis CSS no `:root` e mapeadas no bloco `@theme` do arquivo `client/src/index.css`.

### Variáveis de Cor Principal
- `--primary`: Azul escuro (#233e66) - Cor principal da marca.
- `--secondary`: Azul médio (#42789f).
- `--accent`: Amarelo (#f1c40f) - Usado para destaques e ações.
- `--background`: Bege claro/Cinza (#f5f5f4).

### Configuração Técnica (Importante)
Para que as cores sejam reconhecidas pelo Tailwind v4 como classes utilitárias (ex: `bg-primary`, `text-secondary`, `border-border`), elas devem ser mapeadas no `@theme`.

**Sombras vs Bordas:**
O sistema **não utiliza sombras** (`shadow`). Em vez disso, todos os containers (Cards, Listas, Diálogos) utilizam bordas sutis (`border-border`). As sombras foram globalmente desativadas no `index.css`:
```css
@theme inline {
  --shadow: none;
  --shadow-sm: none;
  /* ... */
}
```

### Tipografia
- **Display**: DM Sans
- **Sans**: DM Sans
- **Mono**: JetBrains Mono

## Componentes
O sistema utiliza componentes baseados em **Radix UI** e estilizados com Tailwind CSS, seguindo um padrão de:
- **Bordas**: Todas as superfícies devem ter `border` ou `border-border` e **nenhuma sombra**.
- **Arredondamento**: Padrão de bordas arredondadas generosas (`--radius: 1.5rem` ou `rounded-2xl`).

## Gráficos (Data Viz)
Para manter a consistência com o layout:
- **Alinhamento**: Os textos do eixo Y devem ser **alinhados à esquerda** (`textAnchor: 'start'`) para ficarem alinhados verticalmente com o título do gráfico.
- **Margens**: O container do gráfico deve ter margem esquerda zero para que os rótulos iniciem no limite do grid.

