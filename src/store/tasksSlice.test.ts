import { describe, it, expect } from 'vitest'
import tasksReducer, {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  Task,
} from './tasksSlice'

describe('tasksSlice', () => {
  const initialState = {
    items: [],
    archivedItems: [],
    loading: false,
    error: null,
  }

  const mockTask: Task = {
    id: 1,
    userId: 1,
    title: 'Test Task',
    subject: 'Test Subject',
    dueDate: '2025-12-31',
    done: false,
    notes: 'Test notes',
    createdAt: '2025-12-18T10:00:00.000Z',
    archived: false,
  }

  it('should return initial state', () => {
    expect(tasksReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  describe('fetchTasks', () => {
    it('should set loading to true when pending', () => {
      const action = { type: fetchTasks.pending.type }
      const state = tasksReducer(initialState, action)
      expect(state.loading).toBe(true)
      expect(state.error).toBe(null)
    })

    it('should add tasks when fulfilled', () => {
      const tasks = [mockTask]
      const action = { type: fetchTasks.fulfilled.type, payload: tasks }
      const state = tasksReducer(initialState, action)
      expect(state.items).toEqual(tasks)
      expect(state.loading).toBe(false)
    })

    it('should set error when rejected', () => {
      const action = {
        type: fetchTasks.rejected.type,
        error: { message: 'Error loading tasks' },
      }
      const state = tasksReducer(initialState, action)
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Error loading tasks')
    })
  })

  describe('createTask', () => {
    it('should add new task to items', () => {
      const action = { type: createTask.fulfilled.type, payload: mockTask }
      const state = tasksReducer(initialState, action)
      expect(state.items).toHaveLength(1)
      expect(state.items[0]).toEqual(mockTask)
    })
  })

  describe('updateTask', () => {
    it('should update existing task', () => {
      const stateWithTask = {
        ...initialState,
        items: [mockTask],
      }
      const updatedTask = { ...mockTask, done: true }
      const action = { type: updateTask.fulfilled.type, payload: updatedTask }
      const state = tasksReducer(stateWithTask, action)
      expect(state.items[0].done).toBe(true)
    })

    it('should not modify other tasks', () => {
      const task2 = { ...mockTask, id: 2, title: 'Task 2' }
      const stateWithTasks = {
        ...initialState,
        items: [mockTask, task2],
      }
      const updatedTask = { ...mockTask, done: true }
      const action = { type: updateTask.fulfilled.type, payload: updatedTask }
      const state = tasksReducer(stateWithTasks, action)
      expect(state.items).toHaveLength(2)
      expect(state.items[1]).toEqual(task2)
    })
  })

  describe('deleteTask', () => {
    it('should remove task from items', () => {
      const stateWithTask = {
        ...initialState,
        items: [mockTask],
      }
      const action = { type: deleteTask.fulfilled.type, payload: 1 }
      const state = tasksReducer(stateWithTask, action)
      expect(state.items).toHaveLength(0)
    })

    it('should only remove specified task', () => {
      const task2 = { ...mockTask, id: 2 }
      const stateWithTasks = {
        ...initialState,
        items: [mockTask, task2],
      }
      const action = { type: deleteTask.fulfilled.type, payload: 1 }
      const state = tasksReducer(stateWithTasks, action)
      expect(state.items).toHaveLength(1)
      expect(state.items[0].id).toBe(2)
    })
  })
})

