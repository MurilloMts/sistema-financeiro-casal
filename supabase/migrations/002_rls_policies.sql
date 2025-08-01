-- Configuração de Row Level Security (RLS) para isolamento por casal

-- Habilitar RLS em todas as tabelas
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para obter o couple_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_couple_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT couple_id 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para a tabela couples
CREATE POLICY "Usuários podem ver apenas seu próprio casal" ON couples
  FOR SELECT USING (id = get_user_couple_id());

CREATE POLICY "Usuários podem atualizar apenas seu próprio casal" ON couples
  FOR UPDATE USING (id = get_user_couple_id());

-- Políticas para a tabela profiles
CREATE POLICY "Usuários podem ver perfis do seu casal" ON profiles
  FOR SELECT USING (couple_id = get_user_couple_id() OR id = auth.uid());

CREATE POLICY "Usuários podem inserir seu próprio perfil" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Políticas para a tabela categories
CREATE POLICY "Usuários podem ver categorias do seu casal" ON categories
  FOR SELECT USING (couple_id = get_user_couple_id() OR couple_id IS NULL);

CREATE POLICY "Usuários podem inserir categorias para seu casal" ON categories
  FOR INSERT WITH CHECK (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem atualizar categorias do seu casal" ON categories
  FOR UPDATE USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem excluir categorias do seu casal" ON categories
  FOR DELETE USING (couple_id = get_user_couple_id());

-- Políticas para a tabela transactions
CREATE POLICY "Usuários podem ver transações do seu casal" ON transactions
  FOR SELECT USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem inserir transações para seu casal" ON transactions
  FOR INSERT WITH CHECK (couple_id = get_user_couple_id() AND user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar qualquer transação do seu casal" ON transactions
  FOR UPDATE USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem excluir qualquer transação do seu casal" ON transactions
  FOR DELETE USING (couple_id = get_user_couple_id());

-- Políticas para a tabela bills
CREATE POLICY "Usuários podem ver contas do seu casal" ON bills
  FOR SELECT USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem inserir contas para seu casal" ON bills
  FOR INSERT WITH CHECK (couple_id = get_user_couple_id() AND user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar contas do seu casal" ON bills
  FOR UPDATE USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem excluir contas do seu casal" ON bills
  FOR DELETE USING (couple_id = get_user_couple_id());

-- Políticas para a tabela shopping_lists
CREATE POLICY "Usuários podem ver listas de compras do seu casal" ON shopping_lists
  FOR SELECT USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem inserir listas de compras para seu casal" ON shopping_lists
  FOR INSERT WITH CHECK (couple_id = get_user_couple_id() AND user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar listas de compras do seu casal" ON shopping_lists
  FOR UPDATE USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem excluir listas de compras do seu casal" ON shopping_lists
  FOR DELETE USING (couple_id = get_user_couple_id());

-- Políticas para a tabela shopping_items
CREATE POLICY "Usuários podem ver itens de compras do seu casal" ON shopping_items
  FOR SELECT USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE couple_id = get_user_couple_id()
    )
  );

CREATE POLICY "Usuários podem inserir itens de compras para seu casal" ON shopping_items
  FOR INSERT WITH CHECK (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE couple_id = get_user_couple_id()
    )
  );

CREATE POLICY "Usuários podem atualizar itens de compras do seu casal" ON shopping_items
  FOR UPDATE USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE couple_id = get_user_couple_id()
    )
  );

CREATE POLICY "Usuários podem excluir itens de compras do seu casal" ON shopping_items
  FOR DELETE USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE couple_id = get_user_couple_id()
    )
  );

-- Políticas para a tabela budgets
CREATE POLICY "Usuários podem ver orçamentos do seu casal" ON budgets
  FOR SELECT USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem inserir orçamentos para seu casal" ON budgets
  FOR INSERT WITH CHECK (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem atualizar orçamentos do seu casal" ON budgets
  FOR UPDATE USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem excluir orçamentos do seu casal" ON budgets
  FOR DELETE USING (couple_id = get_user_couple_id());

-- Políticas para a tabela budget_categories
CREATE POLICY "Usuários podem ver categorias de orçamento do seu casal" ON budget_categories
  FOR SELECT USING (
    budget_id IN (
      SELECT id FROM budgets WHERE couple_id = get_user_couple_id()
    )
  );

CREATE POLICY "Usuários podem inserir categorias de orçamento para seu casal" ON budget_categories
  FOR INSERT WITH CHECK (
    budget_id IN (
      SELECT id FROM budgets WHERE couple_id = get_user_couple_id()
    )
  );

CREATE POLICY "Usuários podem atualizar categorias de orçamento do seu casal" ON budget_categories
  FOR UPDATE USING (
    budget_id IN (
      SELECT id FROM budgets WHERE couple_id = get_user_couple_id()
    )
  );

CREATE POLICY "Usuários podem excluir categorias de orçamento do seu casal" ON budget_categories
  FOR DELETE USING (
    budget_id IN (
      SELECT id FROM budgets WHERE couple_id = get_user_couple_id()
    )
  );