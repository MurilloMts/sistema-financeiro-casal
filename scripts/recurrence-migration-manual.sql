-- Migração manual para adicionar colunas de recorrência
-- Execute este script no SQL Editor do Supabase Dashboard

-- Adicionar colunas de recorrência à tabela bills
ALTER TABLE bills ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('MONTHLY', 'WEEKLY', 'YEARLY', 'CUSTOM'));
ALTER TABLE bills ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS next_due_date DATE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS parent_bill_id UUID REFERENCES bills(id) ON DELETE CASCADE;

-- Adicionar colunas de recorrência à tabela transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('MONTHLY', 'WEEKLY', 'YEARLY', 'CUSTOM'));
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS next_transaction_date DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS parent_transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_bills_recurring ON bills(is_recurring, next_due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(is_recurring, next_transaction_date);

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND column_name IN ('is_recurring', 'recurrence_type', 'recurrence_interval', 'recurrence_end_date', 'next_transaction_date', 'parent_transaction_id')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bills' 
AND column_name IN ('is_recurring', 'recurrence_type', 'recurrence_interval', 'recurrence_end_date', 'next_due_date', 'parent_bill_id')
ORDER BY column_name;
