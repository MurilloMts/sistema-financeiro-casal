-- Adicionar tabela para histórico de preços por estabelecimento

-- Tabela de estabelecimentos
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(couple_id, name)
);

-- Tabela de histórico de preços
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name VARCHAR(255) NOT NULL,
  price DECIMAL(8,2) NOT NULL CHECK (price >= 0),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  shopping_item_id UUID REFERENCES shopping_items(id) ON DELETE SET NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna store na tabela shopping_items
ALTER TABLE shopping_items ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE SET NULL;

-- Índices para performance
CREATE INDEX idx_price_history_item_name ON price_history(item_name);
CREATE INDEX idx_price_history_store ON price_history(store_id);
CREATE INDEX idx_price_history_couple ON price_history(couple_id);
CREATE INDEX idx_price_history_date ON price_history(recorded_at DESC);
CREATE INDEX idx_stores_couple ON stores(couple_id);
CREATE INDEX idx_shopping_items_store ON shopping_items(store_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para registrar preço no histórico
CREATE OR REPLACE FUNCTION record_price_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar preço apenas quando item é marcado como comprado e tem preço real
  IF NEW.purchased = true AND NEW.actual_price IS NOT NULL AND 
     (OLD.purchased = false OR OLD.actual_price IS NULL OR OLD.actual_price != NEW.actual_price) THEN
    
    INSERT INTO price_history (
      item_name,
      price,
      store_id,
      couple_id,
      shopping_item_id,
      recorded_at
    )
    SELECT 
      NEW.name,
      NEW.actual_price,
      NEW.store_id,
      sl.couple_id,
      NEW.id,
      NOW()
    FROM shopping_lists sl
    WHERE sl.id = NEW.shopping_list_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar histórico automaticamente
CREATE TRIGGER record_price_on_purchase
  AFTER UPDATE ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION record_price_history();

-- Função para obter comparação de preços por item
CREATE OR REPLACE FUNCTION get_price_comparison(
  item_name_param VARCHAR(255),
  couple_id_param UUID,
  days_back INTEGER DEFAULT 90
)
RETURNS TABLE(
  store_name VARCHAR(255),
  store_id UUID,
  avg_price DECIMAL(8,2),
  min_price DECIMAL(8,2),
  max_price DECIMAL(8,2),
  last_price DECIMAL(8,2),
  last_recorded TIMESTAMP WITH TIME ZONE,
  price_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name as store_name,
    s.id as store_id,
    ROUND(AVG(ph.price), 2) as avg_price,
    MIN(ph.price) as min_price,
    MAX(ph.price) as max_price,
    (
      SELECT ph2.price 
      FROM price_history ph2 
      WHERE ph2.store_id = s.id 
        AND ph2.item_name ILIKE item_name_param
        AND ph2.couple_id = couple_id_param
      ORDER BY ph2.recorded_at DESC 
      LIMIT 1
    ) as last_price,
    (
      SELECT ph2.recorded_at 
      FROM price_history ph2 
      WHERE ph2.store_id = s.id 
        AND ph2.item_name ILIKE item_name_param
        AND ph2.couple_id = couple_id_param
      ORDER BY ph2.recorded_at DESC 
      LIMIT 1
    ) as last_recorded,
    COUNT(ph.id)::INTEGER as price_count
  FROM stores s
  LEFT JOIN price_history ph ON s.id = ph.store_id 
    AND ph.item_name ILIKE item_name_param
    AND ph.couple_id = couple_id_param
    AND ph.recorded_at >= NOW() - INTERVAL '1 day' * days_back
  WHERE s.couple_id = couple_id_param
  GROUP BY s.id, s.name
  HAVING COUNT(ph.id) > 0
  ORDER BY avg_price ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter histórico de preços de um item
CREATE OR REPLACE FUNCTION get_item_price_history(
  item_name_param VARCHAR(255),
  couple_id_param UUID,
  days_back INTEGER DEFAULT 365
)
RETURNS TABLE(
  price DECIMAL(8,2),
  store_name VARCHAR(255),
  recorded_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ph.price,
    s.name as store_name,
    ph.recorded_at
  FROM price_history ph
  JOIN stores s ON ph.store_id = s.id
  WHERE ph.item_name ILIKE item_name_param
    AND ph.couple_id = couple_id_param
    AND ph.recorded_at >= NOW() - INTERVAL '1 day' * days_back
  ORDER BY ph.recorded_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS para novas tabelas
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Políticas para stores
CREATE POLICY "Usuários podem ver estabelecimentos do seu casal" ON stores
  FOR SELECT USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem inserir estabelecimentos para seu casal" ON stores
  FOR INSERT WITH CHECK (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem atualizar estabelecimentos do seu casal" ON stores
  FOR UPDATE USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem excluir estabelecimentos do seu casal" ON stores
  FOR DELETE USING (couple_id = get_user_couple_id());

-- Políticas para price_history
CREATE POLICY "Usuários podem ver histórico de preços do seu casal" ON price_history
  FOR SELECT USING (couple_id = get_user_couple_id());

CREATE POLICY "Usuários podem inserir histórico de preços para seu casal" ON price_history
  FOR INSERT WITH CHECK (couple_id = get_user_couple_id());

-- Inserir alguns estabelecimentos padrão (será feito via aplicação)
