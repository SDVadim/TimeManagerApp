import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchTasks, updateTask } from '../store/tasksSlice'
import { getCurrentUser, logout as logoutUser } from '../utils/api'
import '../styles.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items: tasks, loading } = useAppSelector((state) => state.tasks)
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    dispatch(fetchTasks(currentUser.id))
  }, [dispatch, navigate, currentUser?.id])

  const incompleteTasks = useMemo(() =>
    tasks.filter((task) => !task.done && !task.archived),
    [tasks]
  )

  const handleToggleDone = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      dispatch(updateTask({ ...task, done: !task.done }))
    }
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указан'
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getDaysLeft = (dateString?: string) => {
    if (!dateString) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(dateString)
    dueDate.setHours(0, 0, 0, 0)
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diff < 0) return { text: `Просрочено на ${Math.abs(diff)} дн.`, urgent: true }
    if (diff === 0) return { text: 'Сегодня!', urgent: true }
    if (diff === 1) return { text: 'Завтра', urgent: true }
    if (diff <= 3) return { text: `Через ${diff} дн.`, urgent: true }
    return { text: `Через ${diff} дн.`, urgent: false }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1 className="dashboard-title">Привет, {currentUser?.displayName}! 👋</h1>
            <p className="dashboard-subtitle">
              {incompleteTasks.length === 0
                ? 'Все задачи выполнены! 🎉'
                : `У вас ${incompleteTasks.length} ${incompleteTasks.length === 1 ? 'задача' : 'задач'} в работе`}
            </p>
          </div>
          <div className="dashboard-actions">
            <button
              onClick={() => navigate('/statistics')}
              className="btn btn-secondary"
            >
              📊 Статистика
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="btn btn-primary"
            >
              ✏️ Редактировать задачи
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка задач...</p>
          </div>
        ) : incompleteTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <h2>Отличная работа!</h2>
            <p>Все задачи выполнены. Добавьте новые или отдохните!</p>
            <button
              onClick={() => navigate('/tasks')}
              className="btn btn-primary"
            >
              Добавить новую задачу
            </button>
          </div>
        ) : (
          <div className="tasks-grid">
            {incompleteTasks.map((task) => {
              const daysLeft = getDaysLeft(task.dueDate)
              return (
                <div key={task.id} className="task-card">
                  <div className="task-card-header">
                    <button
                      onClick={() => handleToggleDone(task.id)}
                      className="task-checkbox"
                      aria-label="Отметить как выполненную"
                    >
                      <div className="checkbox-circle"></div>
                    </button>
                    <div className="task-content">
                      <h3 className="task-title">{task.title}</h3>
                      {task.subject && (
                        <span className="task-subject">{task.subject}</span>
                      )}
                    </div>
                  </div>

                  {task.notes && (
                    <p className="task-notes">{task.notes}</p>
                  )}

                  <div className="task-footer">
                    <div className="task-date">
                      📅 {formatDate(task.dueDate)}
                    </div>
                    {daysLeft && (
                      <div className={`task-deadline ${daysLeft.urgent ? 'urgent' : ''}`}>
                        ⏰ {daysLeft.text}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

