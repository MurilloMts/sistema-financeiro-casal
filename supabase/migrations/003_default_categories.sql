-- Inserção de categorias padrão para novos casais

-- Função para criar categorias padrão para um casal
CREATE OR REPLACE FUNCTION create_default_categories(couple_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Categorias de Despesas
  INSERT INTO categories (name, color, type, is_default, couple_id) VALUES
    ('Alimentação', '#ef4444', 'EXPENSE', true, couple_id_param),
    ('Transporte', '#3b82f6', 'EXPENSE', true, couple_id_param),
    ('Moradia', '#8b5cf6', 'EXPENSE', true, couple_id_param),
    ('Saúde', '#10b981', 'EXPENSE', true, couple_id_param),
    ('Educação', '#f59e0b', 'EXPENSE', true, couple_id_param),
    ('Lazer', '#ec4899', 'EXPENSE', true, couple_id_param),
    ('Vestuário', '#6366f1', 'EXPENSE', true, couple_id_param),
    ('Serviços', '#84cc16', 'EXPENSE', true, couple_id_param),
    ('Impostos', '#dc2626', 'EXPENSE', true, couple_id_param),
    ('Outros Gastos', '#6b7280', 'EXPENSE', true, couple_id_param);
  
  -- Categorias de Receitas
  INSERT INTO categories (name, color, type, is_default, couple_id) VALUES
    ('Salário', '#059669', 'INCOME', true, couple_id_param),
    ('Freelance', '#0891b2', 'INCOME', true, couple_id_param),
    ('Investimentos', '#7c3aed', 'INCOME', true, couple_id_param),
    ('Vendas', '#ea580c', 'INCOME', true, couple_id_param),
    ('Outras Receitas', '#6b7280', 'INCOME', true, couple_id_param);
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar categorias padrão quando um novo casal é criado
CREATE OR REPLACE FUNCTION trigger_create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_categories_for_new_couple
  AFTER INSERT ON couples
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_default_categories();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
