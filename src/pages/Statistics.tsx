import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchTasks, fetchArchivedTasks } from '../store/tasksSlice'
import { getCurrentUser } from '../utils/api'
import '../styles.css'

export default function Statistics() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items: tasks, archivedItems, loading } = useAppSelector((state) => state.tasks)
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    dispatch(fetchTasks(currentUser.id))
    dispatch(fetchArchivedTasks(currentUser.id))
  }, [dispatch, navigate, currentUser?.id])

  const userTasks = useMemo(() =>
    tasks.filter(task => !task.archived),
    [tasks]
  )

  const userArchivedTasks = useMemo(() =>
    archivedItems,
    [archivedItems]
  )

  const getCompletedTasksLastWeek = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    return userTasks.filter((task) => {
      if (task.done && task.completedAt) {
        const completedDate = new Date(task.completedAt)
        return completedDate >= oneWeekAgo
      }
      return false
    })
  }

  const getWeeklyStatistics = () => {
    const stats: { [key: string]: number } = {}
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      stats[dateKey] = 0
    }

    const completedTasks = getCompletedTasksLastWeek()
    completedTasks.forEach((task) => {
      if (task.completedAt) {
        const dateKey = task.completedAt.split('T')[0]
        if (stats.hasOwnProperty(dateKey)) {
          stats[dateKey]++
        }
      }
    })

    return stats
  }

  const calculateDuration = (createdAt?: string, completedAt?: string) => {
    if (!createdAt || !completedAt) return 'Не определено'

    const created = new Date(createdAt)
    const completed = new Date(completedAt)
    const diffMs = completed.getTime() - created.getTime()

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) {
      return `${days} дн. ${hours} ч.`
    } else if (hours > 0) {
      return `${hours} ч.`
    } else {
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      return `${minutes} мин.`
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const completedTasksLastWeek = getCompletedTasksLastWeek()
  const weeklyStats = getWeeklyStatistics()
  const maxTasksPerDay = Math.max(...Object.values(weeklyStats), 1)

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    return days[date.getDay()]
  }

  return (
    <div className="statistics-container">
      <header className="statistics-header">
        <button onClick={() => navigate('/dashboard')} className="btn btn-back">
          ← Назад к главной
        </button>
        <h1>📊 Статистика</h1>
        <div></div>
      </header>

      <main className="statistics-main">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка...</p>
          </div>
        ) : (
          <>
            {/* График выполненных задач за неделю */}
            <section className="stats-section">
              <h2>График выполнения задач за неделю</h2>
              <div className="chart-container">
                <div className="chart">
                  {Object.entries(weeklyStats).map(([date, count]) => (
                    <div key={date} className="chart-bar-wrapper">
                      <div className="chart-bar-container">
                        <div
                          className="chart-bar"
                          style={{ height: `${(count / maxTasksPerDay) * 100}%` }}
                        >
                          {count > 0 && <span className="chart-value">{count}</span>}
                        </div>
                      </div>
                      <div className="chart-label">
                        <div className="chart-day">{getDayName(date)}</div>
                        <div className="chart-date">{new Date(date).getDate()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="stats-summary">
                <div className="stat-card">
                  <div className="stat-value">{completedTasksLastWeek.length}</div>
                  <div className="stat-label">Выполнено за неделю</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {completedTasksLastWeek.length > 0
                      ? (completedTasksLastWeek.length / 7).toFixed(1)
                      : '0'}
                  </div>
                  <div className="stat-label">В среднем в день</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{Math.max(...Object.values(weeklyStats))}</div>
                  <div className="stat-label">Лучший день</div>
                </div>
              </div>
            </section>

            {/* Список выполненных задач за неделю */}
            <section className="stats-section">
              <h2>Выполненные задачи (последняя неделя)</h2>
              {completedTasksLastWeek.length === 0 ? (
                <div className="empty-state-small">
                  <p>За последнюю неделю не выполнено ни одной задачи</p>
                </div>
              ) : (
                <div className="completed-tasks-list">
                  {completedTasksLastWeek.map((task) => (
                    <div key={task.id} className="completed-task-card">
                      <div className="completed-task-header">
                        <h3>✓ {task.title}</h3>
                        {task.subject && <span className="badge">{task.subject}</span>}
                      </div>
                      <div className="completed-task-info">
                        <div className="info-item">
                          <span className="info-label">⏱️ Время выполнения:</span>
                          <span className="info-value">
                            {calculateDuration(task.createdAt, task.completedAt)}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">✅ Завершено:</span>
                          <span className="info-value">{formatDate(task.completedAt)}</span>
                        </div>
                      </div>
                      {task.notes && (
                        <p className="completed-task-notes">{task.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Архив задач */}
            <section className="stats-section">
              <h2>Архив выполненных задач</h2>
              <p className="section-description">
                Задачи автоматически архивируются через неделю после выполнения
              </p>
              {userArchivedTasks.length === 0 ? (
                <div className="empty-state-small">
                  <p>Архив пуст</p>
                </div>
              ) : (
                <div className="archive-list">
                  {userArchivedTasks.map((task) => (
                    <div key={task.id} className="archive-item">
                      <div className="archive-icon">📦</div>
                      <div className="archive-content">
                        <h4>{task.title}</h4>
                        {task.subject && <span className="archive-subject">• {task.subject}</span>}
                        {task.completedAt && (
                          <span className="archive-date">
                            • Выполнено {formatDate(task.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

