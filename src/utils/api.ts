import axios from 'axios'

const API_URL = 'http://localhost:4000/api'

export interface User {
  id: number
  username: string
  displayName: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

const CURRENT_USER_KEY = 'currentUser'
const AUTH_KEY = 'isAuthenticated'

export const registerUser = async (
  username: string,
  password: string,
  displayName: string
): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, {
      username,
      password,
      displayName
    })
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      return error.response.data
    }
    return { success: false, error: 'Ошибка при регистрации' }
  }
}

export const authenticateUser = async (
  username: string,
  password: string
): Promise<User | null> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
      username,
      password
    })

    if (response.data.success && response.data.user) {
      return response.data.user
    }
    return null
  } catch (error: unknown) {
    console.error('Authentication error:', error)
    return null
  }
}

export const setCurrentUser = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  localStorage.setItem(AUTH_KEY, 'true')
}

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem(CURRENT_USER_KEY)
  if (userData) {
    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  }
  return null
}

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === 'true' && getCurrentUser() !== null
}

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY)
  localStorage.removeItem(AUTH_KEY)
}

