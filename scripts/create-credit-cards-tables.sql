-- Tabela para cartões de crédito
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  last_four_digits VARCHAR(4) NOT NULL,
  credit_limit DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  due_date INTEGER NOT NULL CHECK (due_date >= 1 AND due_date <= 31),
  closing_date INTEGER NOT NULL CHECK (closing_date >= 1 AND closing_date <= 31),
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para gastos dos cartões de crédito
CREATE TABLE IF NOT EXISTS credit_card_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_card_id UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  installments INTEGER DEFAULT 1 CHECK (installments >= 1 AND installments <= 24),
  current_installment INTEGER DEFAULT 1 CHECK (current_installment >= 1),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_credit_cards_couple_id ON credit_cards(couple_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_is_active ON credit_cards(is_active);

CREATE INDEX IF NOT EXISTS idx_credit_card_expenses_credit_card_id ON credit_card_expenses(credit_card_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_expenses_couple_id ON credit_card_expenses(couple_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_expenses_user_id ON credit_card_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_expenses_expense_date ON credit_card_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_credit_card_expenses_category_id ON credit_card_expenses(category_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credit_cards_updated_at 
    BEFORE UPDATE ON credit_cards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_card_expenses_updated_at 
    BEFORE UPDATE ON credit_card_expenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) para cartões de crédito
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view credit cards from their couple" ON credit_cards
    FOR SELECT USING (
        couple_id IN (
            SELECT couple_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert credit cards for their couple" ON credit_cards
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        couple_id IN (
            SELECT couple_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update credit cards from their couple" ON credit_cards
    FOR UPDATE USING (
        couple_id IN (
            SELECT couple_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete credit cards from their couple" ON credit_cards
    FOR DELETE USING (
        couple_id IN (
            SELECT couple_id FROM profiles WHERE id = auth.uid()
        )
    );

-- RLS (Row Level Security) para gastos dos cartões
ALTER TABLE credit_card_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view credit card expenses from their couple" ON credit_card_expenses
    FOR SELECT USING (
        couple_id IN (
            SELECT couple_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert credit card expenses for their couple" ON credit_card_expenses
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        couple_id IN (
            SELECT couple_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update credit card expenses from their couple" ON credit_card_expenses
    FOR UPDATE USING (
        couple_id IN (
            SELECT couple_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete credit card expenses from their couple" ON credit_card_expenses
    FOR DELETE USING (
        couple_id IN (
            SELECT couple_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Comentários nas tabelas
COMMENT ON TABLE credit_cards IS 'Tabela para armazenar informações dos cartões de crédito';
COMMENT ON COLUMN credit_cards.name IS 'Nome do cartão (ex: Nubank, Itaú)';
COMMENT ON COLUMN credit_cards.last_four_digits IS 'Últimos 4 dígitos do cartão';
COMMENT ON COLUMN credit_cards.credit_limit IS 'Limite do cartão em reais';
COMMENT ON COLUMN credit_cards.current_balance IS 'Saldo atual usado do cartão';
COMMENT ON COLUMN credit_cards.due_date IS 'Dia do mês do vencimento (1-31)';
COMMENT ON COLUMN credit_cards.closing_date IS 'Dia do mês do fechamento da fatura (1-31)';
COMMENT ON COLUMN credit_cards.color IS 'Cor do cartão em hexadecimal';

COMMENT ON TABLE credit_card_expenses IS 'Tabela para armazenar gastos dos cartões de crédito';
COMMENT ON COLUMN credit_card_expenses.description IS 'Descrição do gasto';
COMMENT ON COLUMN credit_card_expenses.amount IS 'Valor do gasto em reais';
COMMENT ON COLUMN credit_card_expenses.expense_date IS 'Data do gasto';
COMMENT ON COLUMN credit_card_expenses.installments IS 'Número total de parcelas';
COMMENT ON COLUMN credit_card_expenses.current_installment IS 'Parcela atual (para controle)';