import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase')
const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with loading state', () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.profile).toBe(null)
  })

  it('sets user and profile when authenticated', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01',
    }

    const mockProfile = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      couple_id: 'couple-123',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    } as any)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.profile).toEqual(mockProfile)
  })

  it('handles sign in correctly', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01',
    }

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'password')
      expect(response.error).toBe(null)
    })

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })
  })

  it('handles sign in error', async () => {
    const mockError = { message: 'Invalid credentials' }

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'wrongpassword')
      expect(response.error).toEqual(mockError)
    })
  })

  it('handles sign up correctly', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01',
    }

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.signUp('test@example.com', 'password', 'Test User')
      expect(response.error).toBe(null)
    })

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: {
        data: {
          name: 'Test User',
        },
      },
    })
  })

  it('handles sign out correctly', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    expect(result.current.user).toBe(null)
    expect(result.current.profile).toBe(null)
  })

  it('sets up auth state change listener', () => {
    const mockCallback = jest.fn()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any)

    renderHook(() => useAuth())

    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
  })
})