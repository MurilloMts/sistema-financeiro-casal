import { test, expect } from '@playwright/test'

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
          user_metadata: { name: 'Test User' }
        }
      }))
    })

    // Mock API responses
    await page.route('**/rest/v1/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()

      if (url.includes('profiles')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            id: 'mock-profile-id',
            name: 'Test User',
            email: 'test@example.com',
            couple_id: 'mock-couple-id'
          }])
        })
      } else if (url.includes('categories')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: '1', name: 'Alimentação', color: '#EF4444', type: 'expense' },
            { id: '2', name: 'Transporte', color: '#F59E0B', type: 'expense' },
            { id: '3', name: 'Salário', color: '#10B981', type: 'income' }
          ])
        })
      } else if (url.includes('transactions')) {
        if (method === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify([{
              id: 'new-transaction-id',
              description: 'Nova transação',
              amount: 100,
              type: 'expense',
              category_id: '1',
              created_at: new Date().toISOString()
            }])
          })
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                id: '1',
                description: 'Supermercado',
                amount: -200,
                type: 'expense',
                category: { name: 'Alimentação', color: '#EF4444' },
                created_at: new Date().toISOString(),
                responsible: { name: 'Test User' }
              },
              {
                id: '2',
                description: 'Salário',
                amount: 5000,
                type: 'income',
                category: { name: 'Salário', color: '#10B981' },
                created_at: new Date().toISOString(),
                responsible: { name: 'Test User' }
              }
            ])
          })
        }
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        })
      }
    })

    await page.goto('/transacoes')
  })

  test('should display transactions page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Transações')
  })

  test('should display transaction form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="description"]')).toBeVisible()
    await expect(page.locator('input[name="amount"]')).toBeVisible()
    await expect(page.locator('select[name="type"]')).toBeVisible()
    await expect(page.locator('select[name="category_id"]')).toBeVisible()
  })

  test('should create new expense transaction', async ({ page }) => {
    await page.fill('input[name="description"]', 'Café da manhã')
    await page.fill('input[name="amount"]', '25.50')
    await page.selectOption('select[name="type"]', 'expense')

    // Wait for categories to load
    await page.waitForTimeout(500)
    await page.selectOption('select[name="category_id"]', '1')

    await page.click('button[type="submit"]')

    // Should show success message or redirect
    await expect(page.locator('text=Transação criada com sucesso')).toBeVisible()
  })

  test('should create new income transaction', async ({ page }) => {
    await page.fill('input[name="description"]', 'Freelance')
    await page.fill('input[name="amount"]', '500.00')
    await page.selectOption('select[name="type"]', 'income')

    // Wait for categories to load
    await page.waitForTimeout(500)
    await page.selectOption('select[name="category_id"]', '3')

    await page.click('button[type="submit"]')

    await expect(page.locator('text=Transação criada com sucesso')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Descrição é obrigatória')).toBeVisible()
    await expect(page.locator('text=Valor é obrigatório')).toBeVisible()
    await expect(page.locator('text=Categoria é obrigatória')).toBeVisible()
  })

  test('should display transactions list', async ({ page }) => {
    // Wait for transactions to load
    await page.waitForTimeout(1000)

    await expect(page.locator('text=Supermercado')).toBeVisible()
    await expect(page.locator('text=Salário')).toBeVisible()
  })

  test('should filter transactions by type', async ({ page }) => {
    // Wait for transactions to load
    await page.waitForTimeout(1000)

    // Filter by expenses
    await page.click('button:has-text("Despesas")')
    await expect(page.locator('text=Supermercado')).toBeVisible()
    await expect(page.locator('text=Salário')).not.toBeVisible()

    // Filter by income
    await page.click('button:has-text("Receitas")')
    await expect(page.locator('text=Salário')).toBeVisible()
    await expect(page.locator('text=Supermercado')).not.toBeVisible()
  })

  test('should search transactions', async ({ page }) => {
    // Wait for transactions to load
    await page.waitForTimeout(1000)

    await page.fill('input[placeholder*="Buscar"]', 'Supermercado')
    await page.waitForTimeout(500)

    await expect(page.locator('text=Supermercado')).toBeVisible()
    await expect(page.locator('text=Salário')).not.toBeVisible()
  })

  test('should display transaction summary', async ({ page }) => {
    await expect(page.locator('[data-testid="transaction-summary"]')).toBeVisible()

    // Wait for data to load
    await page.waitForTimeout(1000)

    await expect(page.locator('text=Total Receitas')).toBeVisible()
    await expect(page.locator('text=Total Despesas')).toBeVisible()
    await expect(page.locator('text=Saldo')).toBeVisible()
  })

  test('should edit transaction', async ({ page }) => {
    // Wait for transactions to load
    await page.waitForTimeout(1000)

    // Click edit button on first transaction
    await page.click('[data-testid="edit-transaction-1"]')

    // Should open edit form
    await expect(page.locator('input[value="Supermercado"]')).toBeVisible()

    // Edit description
    await page.fill('input[name="description"]', 'Supermercado Editado')
    await page.click('button:has-text("Salvar")')

    await expect(page.locator('text=Transação atualizada com sucesso')).toBeVisible()
  })

  test('should delete transaction', async ({ page }) => {
    // Wait for transactions to load
    await page.waitForTimeout(1000)

    // Click delete button on first transaction
    await page.click('[data-testid="delete-transaction-1"]')

    // Confirm deletion
    await page.click('button:has-text("Confirmar")')

    await expect(page.locator('text=Transação excluída com sucesso')).toBeVisible()
  })

  test('should display pagination', async ({ page }) => {
    // Mock more transactions for pagination
    await page.route('**/rest/v1/transactions*', async (route) => {
      const transactions = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        description: `Transação ${i + 1}`,
        amount: (i % 2 === 0 ? 1 : -1) * (100 + i),
        type: i % 2 === 0 ? 'income' : 'expense',
        category: { name: 'Categoria', color: '#10B981' },
        created_at: new Date().toISOString(),
        responsible: { name: 'Test User' }
      }))

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(transactions)
      })
    })

    await page.reload()
    await page.waitForTimeout(1000)

    await expect(page.locator('[data-testid="pagination"]')).toBeVisible()
    await expect(page.locator('button:has-text("Próxima")')).toBeVisible()
  })
})