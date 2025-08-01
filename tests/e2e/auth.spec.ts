import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL('/auth/login')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Entrar')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Email é obrigatório')).toBeVisible()
    await expect(page.locator('text=Senha é obrigatória')).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Email inválido')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Criar conta')
    await expect(page).toHaveURL('/auth/register')
    await expect(page.locator('h1')).toContainText('Criar Conta')
  })

  test('should display register form', async ({ page }) => {
    await page.goto('/auth/register')
    
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for register form', async ({ page }) => {
    await page.goto('/auth/register')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Nome é obrigatório')).toBeVisible()
    await expect(page.locator('text=Email é obrigatório')).toBeVisible()
    await expect(page.locator('text=Senha é obrigatória')).toBeVisible()
  })

  test('should show error for password mismatch', async ({ page }) => {
    await page.goto('/auth/register')
    
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'different-password')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Senhas não coincidem')).toBeVisible()
  })

  test('should navigate back to login from register', async ({ page }) => {
    await page.goto('/auth/register')
    await page.click('text=Já tem conta? Entrar')
    
    await expect(page).toHaveURL('/auth/login')
  })
})

test.describe('Authenticated User', () => {
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
  })

  test('should redirect to dashboard when authenticated', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display user navigation', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Transações')).toBeVisible()
    await expect(page.locator('text=Contas')).toBeVisible()
    await expect(page.locator('text=Mercado')).toBeVisible()
    await expect(page.locator('text=Relatórios')).toBeVisible()
    await expect(page.locator('text=Orçamento')).toBeVisible()
  })

  test('should allow logout', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Click on user menu
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Sair')
    
    await expect(page).toHaveURL('/auth/login')
  })
})