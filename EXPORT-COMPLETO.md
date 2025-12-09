# GraficaHub - Export Completo do Projeto

## 📋 Resumo do Projeto

Sistema completo de gestão para gráficas (GraficaHub) desenvolvido em Next.js 14 com React, TypeScript e Tailwind CSS.

---

## 🚀 Funcionalidades Implementadas

### 1. Sistema de Autenticação
- Login e registro de usuários
- Armazenamento local (localStorage)
- Proteção de rotas
- Onboarding obrigatório (CPF/CNPJ + Impressoras)

### 2. Dashboard
- Cards de resumo (Pedidos em aberto, Concluídos, Impressoras)
- Tabela de pedidos recentes com filtros
- Gerenciamento de impressoras
- Gerenciamento de materiais
- Criação de novos pedidos
- Cancelamento de pedidos

### 3. Sistema de Pedidos
- **Criação de pedidos** com formulário inteligente:
  - Seleção de Tecnologia (filtro principal)
  - Seleção de Material (filtrado por tecnologia)
  - Seleção de Características/Acabamentos (opcional, por material)
  - Geração automática de nome do pedido
  - Validação completa de campos
- **Cancelamento de pedidos** com confirmação
- Armazenamento no localStorage
- Filtros por status (Todos, Em aberto, Em produção, Concluído, Cancelado)

### 4. Lista de Aceites (Propostas)
- Sistema completo de propostas recebidas
- Ranqueamento inteligente (preço, distância, nota, velocidade)
- Badges automáticos (Recomendado, Mais próximo, Melhor custo-benefício, etc.)
- Comparação de propostas em tabela
- Nome da gráfica oculto até aceitar
- Indicador de preço vs média da região

### 5. Configurações
- Dados da empresa
- Endereço completo
- Upload de logo
- Telefone e contato

---

## 📁 Estrutura de Arquivos

### Tipos e Interfaces

```
src/types/
├── orders.ts          # Tipos de pedidos (Order, OrderStatus, NewOrderFormData)
└── proposals.ts       # Tipos de propostas (Proposal, ProposalWithScore, etc.)
```

### Dados e Configurações

```
src/data/
├── categories.ts                    # Estrutura antiga (compatibilidade)
└── materialsByTechnology.ts        # Nova estrutura baseada em Tecnologia
```

### Utilitários

```
src/utils/
├── orders.ts                    # Funções de gerenciamento de pedidos
├── orderNameGenerator.ts        # Geração automática de nomes
└── proposals.ts                 # Ranqueamento e badges de propostas
```

### Componentes

```
src/components/
├── auth/
│   ├── AuthCard.tsx
│   ├── AuthForm.tsx
│   └── Tabs.tsx
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Select.tsx
├── NewOrderModal.tsx            # Modal de criação de pedidos
├── CancelOrderModal.tsx         # Modal de cancelamento
├── ProposalsList.tsx            # Lista de propostas/aceites
└── SplashScreen.tsx
```

### Páginas

```
src/app/
├── page.tsx                      # Página inicial (Splash Screen)
├── auth/
│   ├── page.tsx                 # Login/Cadastro
│   └── forgot-password/
│       └── page.tsx
├── dashboard/
│   └── page.tsx                 # Dashboard principal
├── setup/
│   └── page.tsx                 # Onboarding
├── settings/
│   └── page.tsx                 # Configurações
└── pedidos/
    └── [id]/
        └── propostas/
            └── page.tsx         # Lista de aceites por pedido
```

### Hooks

```
src/hooks/
└── useAuth.ts                   # Hook de autenticação
```

---

## 🔧 Tecnologias Utilizadas

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animações)
- **Supabase** (configurado, mas usando localStorage por enquanto)

---

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

---

## 🔑 Funcionalidades Detalhadas

### Sistema de Pedidos

#### Criação de Pedidos
1. Seleciona Tecnologia (UV, Solvente/EcoSolvente, Sublimação, DTF Têxtil, DTF-UV)
2. Seleciona Material (filtrado pela tecnologia)
3. Seleciona Características (se disponível para o material)
4. Preenche dimensões e quantidade
5. Nome é gerado automaticamente ou pode ser editado manualmente
6. Salva no localStorage

#### Cancelamento de Pedidos
- Disponível apenas para pedidos "Em aberto" ou "Em produção"
- Modal de confirmação obrigatório
- Atualiza status para "Cancelado"
- Remove ações de "Ver propostas"

### Lista de Aceites

#### Ranqueamento
- Score calculado por: Preço (40%), Distância (30%), Nota (20%), Velocidade (10%)
- Normalização automática de valores
- Ordenação do melhor para o pior

#### Badges Automáticos
- **Recomendado**: Maior score geral
- **Mais próximo**: Menor distância
- **Melhor custo-benefício**: Melhor relação preço/nota
- **Mais rápido**: Menor tempo de resposta
- **Melhor avaliada**: Maior nota
- **Aceita cupom**: Se aceita cupom de R$ 50

#### Comparação
- Modal com tabela comparativa
- Todas as propostas lado a lado
- Fácil comparação de atributos

---

## 📝 Estrutura de Dados

### Pedido (Order)
```typescript
{
  id: string
  service: string
  category: OrderCategory
  tecnologia?: Tecnologia
  materialId?: string
  materialName?: string
  caracteristicaId?: string
  caracteristicaName?: string
  width?: string
  height?: string
  quantity: number
  deadline: string
  description?: string
  status: OrderStatus
  createdAt: string
  userId?: string
}
```

### Proposta (Proposal)
```typescript
{
  id: string
  pedidoId: string
  graficaId: string
  graficaNomeReal: string
  distanciaKm: number
  notaGeral: number
  nivel: Level
  precoTotal: number
  tecnologia: Technology
  tempoMedioProducaoHoras: number
  deliveryType: DeliveryType
  aceitaCupom: boolean
  // ... mais campos
}
```

---

## 🗂️ Tecnologias e Materiais

### Tecnologias Disponíveis
1. **UV** - Para materiais rígidos
2. **Solvente/EcoSolvente** - Para lonas, adesivos e banners
3. **Sublimação** - Para papéis fotográficos e tecidos
4. **DTF Têxtil** - Para tecidos específicos
5. **DTF-UV** - Híbrido

### Materiais por Tecnologia

#### UV
- ACM 3mm/4mm
- PVC Espumado 3mm/5mm
- MDF
- Vidro (com características: Impressão UV direta, Adesivado)

#### Solvente/EcoSolvente
- Lonas (440g, 520g, 600g, Frontlit, Backlit)
- Banners (280g, 440g, 510g) - tratados como Lona
- Adesivos (Vinil, Espelhado, Blackout, Perfurado)

#### Sublimação
- Papéis fotográficos (240g, 300g)
- Tecidos (Poliéster, Lienzo, Mesh)

---

## 🎨 UI/UX

### Design System
- Tema escuro (slate-950/900/800)
- Cards com bordas suaves e backdrop blur
- Animações suaves (Framer Motion)
- Responsivo (mobile e desktop)
- Feedback visual claro em todas as ações

### Componentes Reutilizáveis
- Button (primary, secondary, outline)
- Card
- Input (com validação e erros)
- Select (com opções dinâmicas)

---

## 💾 Armazenamento

### LocalStorage Keys
- `graficaHubUsers`: Lista de usuários cadastrados
- `graficaHubCurrentUser`: Usuário atual logado
- `graficaHubOrders`: Lista de pedidos

### Migração Futura
O projeto está preparado para migrar para Supabase:
- Cliente Supabase já configurado (`src/lib/supabaseClient.ts`)
- Estrutura de dados compatível
- Funções podem ser adaptadas facilmente

---

## 🚦 Próximos Passos Sugeridos

1. **Integração com Backend**
   - Migrar do localStorage para Supabase
   - API de propostas real
   - Sistema de notificações

2. **Melhorias de UX**
   - Busca de pedidos
   - Exportação de relatórios
   - Histórico de mudanças de status

3. **Funcionalidades Adicionais**
   - Sistema de cupons
   - Chat com gráficas
   - Avaliações e reviews
   - Integração de pagamento

---

## 📞 Como Usar

### Criar um Pedido
1. Acesse o Dashboard
2. Clique em "Criar pedido"
3. Selecione Tecnologia → Material → Características
4. Preencha dimensões, quantidade e prazo
5. Confirme a criação

### Ver Propostas
1. No Dashboard, clique em "Ver propostas" em um pedido
2. Compare as propostas recebidas
3. Use o botão "Comparar propostas" para ver em tabela
4. Clique em "Escolher essa gráfica" para aceitar

### Cancelar Pedido
1. Na tabela de pedidos, clique em "Cancelar"
2. Confirme a ação no modal
3. O pedido será marcado como "Cancelado"

---

## ✅ Checklist de Funcionalidades

- [x] Autenticação local
- [x] Onboarding obrigatório
- [x] Dashboard completo
- [x] Criação de pedidos com formulário inteligente
- [x] Cancelamento de pedidos
- [x] Filtros de pedidos
- [x] Lista de aceites com ranqueamento
- [x] Badges automáticos
- [x] Comparação de propostas
- [x] Configurações da gráfica
- [x] Sistema de materiais por tecnologia
- [x] Geração automática de nomes
- [x] Responsividade mobile/desktop
- [x] Validação de formulários
- [x] Feedback visual em todas as ações

---

## 📄 Licença

Projeto privado - GraficaHub

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0.0


