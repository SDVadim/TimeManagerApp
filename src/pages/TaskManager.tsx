import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchTasks, createTask, updateTask, deleteTask, Task } from '../store/tasksSlice'
import { getCurrentUser } from '../utils/api'
import '../styles.css'

export default function TaskManager() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items: tasks, loading } = useAppSelector((state) => state.tasks)
  const currentUser = getCurrentUser()

  const [isEditing, setIsEditing] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    dueDate: '',
    notes: '',
    done: false
  })

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    dispatch(fetchTasks(currentUser.id))
  }, [dispatch, navigate, currentUser?.id])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleStartEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      subject: task.subject || '',
      dueDate: task.dueDate || '',
      notes: task.notes || '',
      done: task.done
    })
    setIsEditing(true)
  }

  const handleStartCreate = () => {
    setEditingTask(null)
    setFormData({
      title: '',
      subject: '',
      dueDate: '',
      notes: '',
      done: false
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingTask(null)
    setFormData({
      title: '',
      subject: '',
      dueDate: '',
      notes: '',
      done: false
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) return

    if (editingTask) {
      await dispatch(updateTask({
        ...editingTask,
        title: formData.title,
        subject: formData.subject || undefined,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined,
        done: formData.done
      }))
    } else {
      await dispatch(createTask({
        userId: currentUser.id,
        title: formData.title,
        subject: formData.subject || undefined,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined,
        done: false
      }))
    }

    handleCancelEdit()
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      await dispatch(deleteTask(id))
    }
  }

  const handleToggleDone = async (task: Task) => {
    await dispatch(updateTask({ ...task, done: !task.done }))
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="task-manager-container">
      <header className="task-manager-header">
        <button onClick={() => navigate('/dashboard')} className="btn btn-back">
          ← Назад к главной
        </button>
        <h1>Управление задачами</h1>
        <button onClick={handleStartCreate} className="btn btn-primary">
          + Добавить задачу
        </button>
      </header>

      {isEditing && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Редактировать задачу' : 'Новая задача'}</h2>
              <button onClick={handleCancelEdit} className="modal-close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label htmlFor="title">Название задачи *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Например: Сдать лабораторную по физике"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Предмет</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Например: Физика"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Срок сдачи</label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Заметки</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Дополнительная информация..."
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="task-manager-main">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>Нет задач</h2>
            <p>Создайте первую задачу, чтобы начать работу</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className={`task-item ${task.done ? 'completed' : ''}`}>
                <button
                  onClick={() => handleToggleDone(task)}
                  className="task-checkbox-button"
                >
                  <div className={`checkbox ${task.done ? 'checked' : ''}`}>
                    {task.done && '✓'}
                  </div>
                </button>

                <div className="task-info">
                  <h3 className={task.done ? 'strikethrough' : ''}>{task.title}</h3>
                  <div className="task-meta">
                    {task.subject && <span className="badge">{task.subject}</span>}
                    {task.dueDate && <span className="date">📅 {formatDate(task.dueDate)}</span>}
                  </div>
                  {task.notes && <p className="task-notes-preview">{task.notes}</p>}
                </div>

                <div className="task-actions">
                  <button
                    onClick={() => handleStartEdit(task)}
                    className="btn-icon"
                    title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="btn-icon btn-danger"
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

