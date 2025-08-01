-- Adicionar campos de recorrência às tabelas existentes

-- Atualizar tabela de contas (bills) para suportar recorrência
ALTER TABLE bills ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('MONTHLY', 'WEEKLY', 'YEARLY', 'CUSTOM'));
ALTER TABLE bills ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS next_due_date DATE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS parent_bill_id UUID REFERENCES bills(id) ON DELETE CASCADE;

-- Atualizar tabela de transações para suportar recorrência
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('MONTHLY', 'WEEKLY', 'YEARLY', 'CUSTOM'));
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS next_transaction_date DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS parent_transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE;

-- Criar tabela para templates de recorrência
CREATE TABLE IF NOT EXISTS recurrence_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('BILL', 'TRANSACTION')),
  template_data JSONB NOT NULL,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para gerar próximas ocorrências de contas recorrentes
CREATE OR REPLACE FUNCTION generate_recurring_bills()
RETURNS void AS $$
DECLARE
  bill_record RECORD;
  next_date DATE;
BEGIN
  -- Buscar contas recorrentes que precisam gerar nova ocorrência
  FOR bill_record IN 
    SELECT * FROM bills 
    WHERE is_recurring = TRUE 
    AND (next_due_date IS NULL OR next_due_date <= CURRENT_DATE)
    AND (recurrence_end_date IS NULL OR recurrence_end_date > CURRENT_DATE)
  LOOP
    -- Calcular próxima data
    CASE bill_record.recurrence_type
      WHEN 'MONTHLY' THEN
        next_date := bill_record.due_date + INTERVAL '1 month' * bill_record.recurrence_interval;
      WHEN 'WEEKLY' THEN
        next_date := bill_record.due_date + INTERVAL '1 week' * bill_record.recurrence_interval;
      WHEN 'YEARLY' THEN
        next_date := bill_record.due_date + INTERVAL '1 year' * bill_record.recurrence_interval;
      ELSE
        next_date := bill_record.due_date + INTERVAL '1 month';
    END CASE;
    
    -- Criar nova conta
    INSERT INTO bills (
      title, amount, due_date, category_id, user_id, couple_id,
      is_recurring, recurrence_type, recurrence_interval, 
      recurrence_end_date, parent_bill_id, notes
    ) VALUES (
      bill_record.title, bill_record.amount, next_date, 
      bill_record.category_id, bill_record.user_id, bill_record.couple_id,
      FALSE, NULL, NULL, NULL, bill_record.id, bill_record.notes
    );
    
    -- Atualizar próxima data da conta pai
    UPDATE bills 
    SET next_due_date = next_date 
    WHERE id = bill_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar próximas ocorrências de transações recorrentes
CREATE OR REPLACE FUNCTION generate_recurring_transactions()
RETURNS void AS $$
DECLARE
  transaction_record RECORD;
  next_date DATE;
BEGIN
  -- Buscar transações recorrentes que precisam gerar nova ocorrência
  FOR transaction_record IN 
    SELECT * FROM transactions 
    WHERE is_recurring = TRUE 
    AND (next_transaction_date IS NULL OR next_transaction_date <= CURRENT_DATE)
    AND (recurrence_end_date IS NULL OR recurrence_end_date > CURRENT_DATE)
  LOOP
    -- Calcular próxima data
    CASE transaction_record.recurrence_type
      WHEN 'MONTHLY' THEN
        next_date := transaction_record.transaction_date + INTERVAL '1 month' * transaction_record.recurrence_interval;
      WHEN 'WEEKLY' THEN
        next_date := transaction_record.transaction_date + INTERVAL '1 week' * transaction_record.recurrence_interval;
      WHEN 'YEARLY' THEN
        next_date := transaction_record.transaction_date + INTERVAL '1 year' * transaction_record.recurrence_interval;
      ELSE
        next_date := transaction_record.transaction_date + INTERVAL '1 month';
    END CASE;
    
    -- Criar nova transação
    INSERT INTO transactions (
      type, amount, description, transaction_date, category_id, 
      user_id, couple_id, parent_transaction_id
    ) VALUES (
      transaction_record.type, transaction_record.amount, 
      transaction_record.description, next_date, transaction_record.category_id,
      transaction_record.user_id, transaction_record.couple_id, transaction_record.id
    );
    
    -- Atualizar próxima data da transação pai
    UPDATE transactions 
    SET next_transaction_date = next_date 
    WHERE id = transaction_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bills_recurring ON bills(is_recurring, next_due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(is_recurring, next_transaction_date);
CREATE INDEX IF NOT EXISTS idx_recurrence_templates_couple ON recurrence_templates(couple_id, type);