# Sistema de Gerenciamento Financeiro para Casais - Versão Final

## 📋 Visão Geral

Sistema completo de gerenciamento financeiro desenvolvido para casais, permitindo controle conjunto de receitas, despesas, contas a pagar e orçamentos.

## 🏗️ Arquitetura do Sistema

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Autenticação**: Supabase Auth
- **Estado**: React Hooks + Context

### Backend
- **Database**: PostgreSQL (Supabase)
- **API**: Supabase (Auto-generated REST API)
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (se necessário)

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. profiles
```sql
- id (uuid, PK)
- email (text)
- name (text)
- couple_id (uuid) -- Conecta os parceiros
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. categories
```sql
- id (uuid, PK)
- name (text)
- color (text)
- type (enum: INCOME, EXPENSE)
- couple_id (uuid, FK)
- created_at (timestamp)
```

#### 3. transactions
```sql
- id (uuid, PK)
- description (text)
- amount (decimal)
- type (enum: INCOME, EXPENSE)
- transaction_date (date)
- category_id (uuid, FK)
- user_id (uuid, FK)
- couple_id (uuid, FK)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 4. bills
```sql
- id (uuid, PK)
- title (text)
- amount (decimal)
- due_date (date)
- status (enum: PENDING, PAID, OVERDUE)
- category_id (uuid, FK)
- user_id (uuid, FK)
- couple_id (uuid, FK)
- paid_at (timestamp)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5. budgets
```sql
- id (uuid, PK)
- name (text)
- amount (decimal)
- period (enum: MONTHLY, YEARLY)
- category_id (uuid, FK)
- couple_id (uuid, FK)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🎯 Funcionalidades Principais

### Dashboard Simplificado
- **Receitas do Mês**: Total de receitas do mês atual
- **Despesas do Mês**: Total de despesas do mês atual  
- **Saldo do Mês**: Diferença entre receitas e despesas
- **Contas Pendentes**: Número e valor total de contas a pagar

### Gestão de Transações
- Adicionar receitas e despesas
- Categorização automática
- Filtros por período, categoria, usuário
- Edição e exclusão de transações

### Contas a Pagar
- Cadastro de contas com vencimento
- Status: Pendente, Paga, Vencida
- Alertas de vencimento
- Histórico de pagamentos

### Categorias
- Criação de categorias personalizadas
- Cores para identificação visual
- Separação por tipo (receita/despesa)

### Orçamentos
- Definição de limites por categoria
- Acompanhamento de gastos vs orçado
- Alertas de limite excedido

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Executar produção
npm run lint         # Verificar código
npm run type-check   # Verificar tipos
```

## 📱 Páginas do Sistema

### 1. Dashboard (/)
- Cards de resumo financeiro
- Gráficos de receitas/despesas
- Contas próximas do vencimento

### 2. Transações (/transacoes)
- Lista de todas as transações
- Formulário de nova transação
- Filtros e busca

### 3. Contas a Pagar (/contas)
- Lista de contas pendentes
- Calendário de vencimentos
- Marcar como paga

### 4. Categorias (/categorias)
- Gerenciar categorias
- Estatísticas por categoria

### 5. Orçamentos (/orcamentos)
- Definir orçamentos mensais
- Acompanhar progresso

### 6. Relatórios (/relatorios)
- Relatórios mensais/anuais
- Gráficos de tendências
- Exportação de dados

## 🔐 Autenticação e Segurança

### Fluxo de Autenticação
1. Login/Registro via Supabase Auth
2. Criação automática do perfil
3. Geração ou entrada em casal (couple_id)
4. Acesso às funcionalidades

### Segurança
- RLS (Row Level Security) habilitado
- Acesso apenas aos dados do próprio casal
- Validação de dados no frontend e backend

## 🚀 Deploy e Produção

### Vercel (Recomendado)
1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático

### Supabase
1. Criar projeto no Supabase
2. Executar migrações SQL
3. Configurar RLS policies

## 📊 Métricas e Analytics

### Dados Coletados
- Número de transações por mês
- Categorias mais utilizadas
- Padrões de gastos
- Aderência ao orçamento

### Dashboard Analytics
- Gráficos de tendências
- Comparações mês a mês
- Alertas inteligentes

## 🔄 Atualizações em Tempo Real

### Supabase Realtime
- Sincronização automática entre dispositivos
- Notificações de mudanças
- Estado sempre atualizado

## 📝 Próximas Funcionalidades

### Versão 2.0
- [ ] Metas financeiras
- [ ] Investimentos
- [ ] Importação de extratos bancários
- [ ] App mobile (React Native)
- [ ] Notificações push
- [ ] Backup automático

## 🛠️ Manutenção

### Backup
- Backup automático do Supabase
- Exportação manual de dados

### Monitoramento
- Logs de erro (Sentry)
- Performance (Vercel Analytics)
- Uptime monitoring

## 📞 Suporte

### Documentação
- README.md com instruções de instalação
- Comentários no código
- Tipos TypeScript documentados

### Troubleshooting
- Logs detalhados
- Mensagens de erro claras
- Fallbacks para falhas de rede

---

**Versão**: 1.0.0  
**Data**: Janeiro 2025  
**Status**: Produção  
**Desenvolvedor**: Sistema Financeiro para Casais
