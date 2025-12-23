import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

export interface Task {
  id: number
  userId: number
  title: string
  subject?: string
  dueDate?: string
  done: boolean
  notes?: string
  createdAt?: string
  completedAt?: string
  archived?: boolean
  archivedAt?: string
}

interface TasksState {
  items: Task[]
  archivedItems: Task[]
  loading: boolean
  error: string | null
}

const initialState: TasksState = {
  items: [],
  archivedItems: [],
  loading: false,
  error: null
}

const API_URL = 'http://localhost:4000/api'

export const fetchTasks = createAsyncThunk('tasks/fetch', async (userId: number) => {
  const res = await axios.get<Task[]>(`${API_URL}/tasks?userId=${userId}`)
  return res.data
})

export const fetchArchivedTasks = createAsyncThunk('tasks/fetchArchived', async (userId: number) => {
  const res = await axios.get<Task[]>(`${API_URL}/tasks/archived?userId=${userId}`)
  return res.data
})

export const createTask = createAsyncThunk('tasks/create', async (payload: Omit<Task, 'id'>) => {
  const res = await axios.post<Task>(`${API_URL}/tasks`, payload)
  return res.data
})

export const updateTask = createAsyncThunk('tasks/update', async (payload: Task) => {
  const res = await axios.put<Task>(`${API_URL}/tasks/${payload.id}`, payload)
  return res.data
})

export const archiveTask = createAsyncThunk('tasks/archive', async (task: Task) => {
  await axios.post(`${API_URL}/tasks/${task.id}/archive`)
  return task.id
})

export const deleteTask = createAsyncThunk('tasks/delete', async (id: number) => {
  await axios.delete(`${API_URL}/tasks/${id}`)
  return id
})

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.items = action.payload
        state.loading = false
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Ошибка'
      })
      .addCase(fetchArchivedTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.archivedItems = action.payload
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.items.push(action.payload)
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.items = state.items.map((t) => (t.id === action.payload.id ? action.payload : t))
      })
      .addCase(archiveTask.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((t) => t.id !== action.payload)
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((t) => t.id !== action.payload)
      })
  }
})

export default slice.reducer

