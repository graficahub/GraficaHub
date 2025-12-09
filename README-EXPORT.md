# GraficaHub - Instruções para Continuar em Casa

## 📦 Arquivo Exportado
- **Arquivo:** `graficahub-export.zip`
- **Localização:** `C:\Users\guilh\graficahub-export.zip`

## 🚀 Como Continuar o Projeto

### 1. Extrair o arquivo ZIP
- Extraia o arquivo `graficahub-export.zip` em uma pasta de sua preferência
- Exemplo: `C:\projetos\graficahub`

### 2. Instalar dependências
Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

### 3. Executar o projeto
```bash
npm run dev
```

O projeto estará disponível em: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
graficahub/
├── src/
│   ├── app/              # Páginas (Next.js App Router)
│   │   ├── auth/         # Login/Cadastro
│   │   ├── setup/        # Onboarding
│   │   ├── dashboard/    # Painel principal
│   │   └── settings/     # Configurações
│   ├── components/       # Componentes React
│   ├── hooks/           # Hooks customizados (useAuth)
│   └── lib/             # Bibliotecas/configurações
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## 🔑 Funcionalidades Implementadas

- ✅ Autenticação local (localStorage)
- ✅ Onboarding obrigatório (CPF/CNPJ + Impressoras)
- ✅ Dashboard completo com:
  - Resumo de pedidos
  - Tabela de pedidos mockados
  - Gerenciamento de impressoras
  - Gerenciamento de materiais
- ✅ Configurações da gráfica:
  - Dados da empresa
  - Endereço completo
  - Upload de logo
- ✅ Sistema de impressoras:
  - Nome opcional
  - Largura editável
  - Tecnologia de tinta

## 📝 Notas Importantes

- O projeto usa **localStorage** para persistência de dados
- Não há backend - tudo é armazenado localmente
- Para produção, será necessário integrar com um backend real (Supabase já está configurado, mas não em uso)

## 🛠️ Tecnologias

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animações)

## 📞 Próximos Passos

1. Extrair o ZIP
2. Instalar dependências (`npm install`)
3. Executar (`npm run dev`)
4. Continuar desenvolvendo! 🚀

