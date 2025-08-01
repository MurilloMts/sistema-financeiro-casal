-- Funções auxiliares para operações do sistema

-- Função para atualizar status de contas vencidas
CREATE OR REPLACE FUNCTION update_overdue_bills()
RETURNS VOID AS $$
BEGIN
  UPDATE bills 
  SET status = 'OVERDUE'
  WHERE due_date < CURRENT_DATE 
    AND status = 'PENDING';
END;
$$ LANGUAGE plpgsql;

-- Função para obter resumo financeiro do mês
CREATE OR REPLACE FUNCTION get_monthly_summary(
  couple_id_param UUID,
  month_param INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
  year_param INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE(
  total_income DECIMAL(12,2),
  total_expenses DECIMAL(12,2),
  balance DECIMAL(12,2),
  pending_bills_count INTEGER,
  pending_bills_amount DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(income.total, 0) as total_income,
    COALESCE(expenses.total, 0) as total_expenses,
    COALESCE(income.total, 0) - COALESCE(expenses.total, 0) as balance,
    COALESCE(bills.count, 0)::INTEGER as pending_bills_count,
    COALESCE(bills.total, 0) as pending_bills_amount
  FROM (
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE couple_id = couple_id_param 
      AND type = 'INCOME'
      AND EXTRACT(MONTH FROM transaction_date) = month_param
      AND EXTRACT(YEAR FROM transaction_date) = year_param
  ) income
  CROSS JOIN (
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE couple_id = couple_id_param 
      AND type = 'EXPENSE'
      AND EXTRACT(MONTH FROM transaction_date) = month_param
      AND EXTRACT(YEAR FROM transaction_date) = year_param
  ) expenses
  CROSS JOIN (
    SELECT 
      COUNT(*) as count,
      COALESCE(SUM(amount), 0) as total
    FROM bills 
    WHERE couple_id = couple_id_param 
      AND status = 'PENDING'
  ) bills;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter contas próximas do vencimento
CREATE OR REPLACE FUNCTION get_upcoming_bills(
  couple_id_param UUID,
  days_ahead INTEGER DEFAULT 15
)
RETURNS TABLE(
  id UUID,
  title VARCHAR(255),
  amount DECIMAL(12,2),
  due_date DATE,
  days_until_due INTEGER,
  category_name VARCHAR(255),
  category_color VARCHAR(7)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.amount,
    b.due_date,
    (b.due_date - CURRENT_DATE)::INTEGER as days_until_due,
    c.name as category_name,
    c.color as category_color
  FROM bills b
  JOIN categories c ON b.category_id = c.id
  WHERE b.couple_id = couple_id_param
    AND b.status = 'PENDING'
    AND b.due_date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
  ORDER BY b.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter gastos por categoria no mês
CREATE OR REPLACE FUNCTION get_expenses_by_category(
  couple_id_param UUID,
  month_param INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
  year_param INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE(
  category_id UUID,
  category_name VARCHAR(255),
  category_color VARCHAR(7),
  total_amount DECIMAL(12,2),
  transaction_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    COALESCE(SUM(t.amount), 0) as total_amount,
    COUNT(t.id)::INTEGER as transaction_count
  FROM categories c
  LEFT JOIN transactions t ON c.id = t.category_id 
    AND t.type = 'EXPENSE'
    AND t.couple_id = couple_id_param
    AND EXTRACT(MONTH FROM t.transaction_date) = month_param
    AND EXTRACT(YEAR FROM t.transaction_date) = year_param
  WHERE c.couple_id = couple_id_param 
    AND c.type IN ('EXPENSE', 'BOTH')
  GROUP BY c.id, c.name, c.color
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para finalizar lista de compras e criar transação
CREATE OR REPLACE FUNCTION finalize_shopping_list(
  shopping_list_id_param UUID,
  category_id_param UUID
)
RETURNS UUID AS $$
DECLARE
  list_record shopping_lists%ROWTYPE;
  transaction_id UUID;
BEGIN
  -- Buscar a lista de compras
  SELECT * INTO list_record
  FROM shopping_lists
  WHERE id = shopping_list_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lista de compras não encontrada';
  END IF;
  
  -- Atualizar status da lista
  UPDATE shopping_lists
  SET status = 'COMPLETED',
      completed_at = NOW()
  WHERE id = shopping_list_id_param;
  
  -- Criar transação de despesa
  INSERT INTO transactions (
    type,
    amount,
    description,
    category_id,
    user_id,
    couple_id,
    transaction_date
  ) VALUES (
    'EXPENSE',
    COALESCE(list_record.total_actual, list_record.total_estimated),
    'Compras: ' || list_record.name,
    category_id_param,
    list_record.user_id,
    list_record.couple_id,
    CURRENT_DATE
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar totais da lista de compras
CREATE OR REPLACE FUNCTION update_shopping_list_totals()
RETURNS TRIGGER AS $$
DECLARE
  list_id UUID;
BEGIN
  -- Determinar o ID da lista baseado na operação
  IF TG_OP = 'DELETE' THEN
    list_id := OLD.shopping_list_id;
  ELSE
    list_id := NEW.shopping_list_id;
  END IF;
  
  -- Atualizar totais da lista
  UPDATE shopping_lists
  SET 
    total_estimated = (
      SELECT COALESCE(SUM(quantity * estimated_price), 0)
      FROM shopping_items
      WHERE shopping_list_id = list_id
    ),
    total_actual = (
      SELECT COALESCE(SUM(quantity * COALESCE(actual_price, estimated_price)), 0)
      FROM shopping_items
      WHERE shopping_list_id = list_id
        AND purchased = true
    )
  WHERE id = list_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar totais da lista quando itens são modificados
CREATE TRIGGER update_shopping_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_list_totals();
