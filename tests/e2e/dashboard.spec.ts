import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
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
      } else if (url.includes('transactions')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: '1',
              description: 'Salário',
              amount: 5000,
              type: 'income',
              category: { name: 'Salário', color: '#10B981' },
              created_at: new Date().toISOString(),
              responsible: { name: 'Test User' }
            },
            {
              id: '2',
              description: 'Supermercado',
              amount: -200,
              type: 'expense',
              category: { name: 'Alimentação', color: '#EF4444' },
              created_at: new Date().toISOString(),
              responsible: { name: 'Test User' }
            }
          ])
        })
      } else if (url.includes('bills')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: '1',
              description: 'Conta de luz',
              amount: 150,
              due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'pending'
            }
          ])
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        })
      }
    })

    await page.goto('/dashboard')
  })

  test('should display dashboard title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should display financial summary cards', async ({ page }) => {
    await expect(page.locator('[data-testid="income-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="expense-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="balance-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="bills-card"]')).toBeVisible()
  })

  test('should display correct financial values', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000)
    
    await expect(page.locator('[data-testid="income-card"]')).toContainText('R$ 5.000,00')
    await expect(page.locator('[data-testid="expense-card"]')).toContainText('R$ 200,00')
    await expect(page.locator('[data-testid="balance-card"]')).toContainText('R$ 4.800,00')
  })

  test('should display recent transactions', async ({ page }) => {
    await expect(page.locator('h2:has-text("Transações Recentes")')).toBeVisible()
    
    // Wait for transactions to load
    await page.waitForTimeout(1000)
    
    await expect(page.locator('text=Salário')).toBeVisible()
    await expect(page.locator('text=Supermercado')).toBeVisible()
  })

  test('should display upcoming bills', async ({ page }) => {
    await expect(page.locator('h2:has-text("Contas Próximas")')).toBeVisible()
    
    // Wait for bills to load
    await page.waitForTimeout(1000)
    
    await expect(page.locator('text=Conta de luz')).toBeVisible()
  })

  test('should display quick actions', async ({ page }) => {
    await expect(page.locator('h2:has-text("Ações Rápidas")')).toBeVisible()
    
    await expect(page.locator('text=Nova Receita')).toBeVisible()
    await expect(page.locator('text=Nova Despesa')).toBeVisible()
    await expect(page.locator('text=Nova Conta')).toBeVisible()
    await expect(page.locator('text=Nova Lista')).toBeVisible()
  })

  test('should navigate to transactions page from quick action', async ({ page }) => {
    await page.click('text=Nova Receita')
    await expect(page).toHaveURL('/transacoes')
  })

  test('should navigate to bills page from quick action', async ({ page }) => {
    await page.click('text=Nova Conta')
    await expect(page).toHaveURL('/contas')
  })

  test('should navigate to shopping page from quick action', async ({ page }) => {
    await page.click('text=Nova Lista')
    await expect(page).toHaveURL('/mercado')
  })

  test('should display notification center', async ({ page }) => {
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible()
  })

  test('should show loading states initially', async ({ page }) => {
    // Reload page to see loading states
    await page.reload()
    
    // Check for skeleton loaders
    await expect(page.locator('.animate-pulse')).toBeVisible()
  })
})