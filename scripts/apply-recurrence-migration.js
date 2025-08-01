require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.log('Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyRecurrenceMigration() {
  console.log('🚀 Aplicando migração de recorrência...')
  
  try {
    // Executar comandos SQL um por vez
    const sqlCommands = [
      // Bills table
      "ALTER TABLE bills ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE bills ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20);",
      "ALTER TABLE bills ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;",
      "ALTER TABLE bills ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;",
      "ALTER TABLE bills ADD COLUMN IF NOT EXISTS next_due_date DATE;",
      "ALTER TABLE bills ADD COLUMN IF NOT EXISTS parent_bill_id UUID;",
      
      // Transactions table
      "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20);",
      "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;",
      "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;",
      "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS next_transaction_date DATE;",
      "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS parent_transaction_id UUID;"
    ]
    
    for (const sql of sqlCommands) {
      console.log(`📝 Executando: ${sql}`)
      const { error } = await supabase.rpc('exec', { sql })
      
      if (error) {
        console.error(`❌ Erro ao executar comando: ${error.message}`)
      } else {
        console.log('✅ Comando executado com sucesso')
      }
    }
    
    console.log('\n🎉 Migração concluída!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

applyRecurrenceMigration()