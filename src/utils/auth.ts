export interface User {
  id: number
  username: string
  password: string
  displayName: string
}

const USERS_STORAGE_KEY = 'studyflow_users'
const CURRENT_USER_KEY = 'currentUser'
const AUTH_KEY = 'isAuthenticated'
const NEXT_USER_ID_KEY = 'studyflow_next_user_id'

const initializeUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }

  const defaultUsers: User[] = []

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers))
  localStorage.setItem(NEXT_USER_ID_KEY, '1')
  return defaultUsers
}

export const getAllUsers = (): User[] => {
  return initializeUsers()
}

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

const getNextUserId = (): number => {
  const nextId = localStorage.getItem(NEXT_USER_ID_KEY)
  const id = nextId ? parseInt(nextId) : 4
  localStorage.setItem(NEXT_USER_ID_KEY, (id + 1).toString())
  return id
}

export const registerUser = (username: string, password: string, displayName: string): { success: boolean; error?: string; user?: User } => {
  const users = getAllUsers()

  if (users.find(u => u.username === username)) {
    return { success: false, error: 'Пользователь с таким именем уже существует' }
  }

  if (username.length < 3) {
    return { success: false, error: 'Имя пользователя должно быть не менее 3 символов' }
  }

  if (password.length < 3) {
    return { success: false, error: 'Пароль должен быть не менее 3 символов' }
  }

  if (displayName.length < 2) {
    return { success: false, error: 'Имя должно быть не менее 2 символов' }
  }

  const newUser: User = {
    id: getNextUserId(),
    username,
    password,
    displayName
  }

  users.push(newUser)
  saveUsers(users)

  return { success: true, user: newUser }
}

export const authenticateUser = (username: string, password: string): User | null => {
  const users = getAllUsers()
  const user = users.find(u => u.username === username && u.password === password)
  return user || null
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

export const setCurrentUser = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  localStorage.setItem(AUTH_KEY, 'true')
}

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY)
  localStorage.removeItem(AUTH_KEY)
}

