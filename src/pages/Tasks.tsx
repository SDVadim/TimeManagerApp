import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchTasks, deleteTask, Task, fetchAiSolution } from '../store/tasksSlice'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../utils/api'

export default function Tasks() {
  const dispatch = useAppDispatch()
  const { items, loading, error, aiSolutions, loadingAiSolution } = useAppSelector((s) => s.tasks)
  const currentUser = getCurrentUser()
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchTasks(currentUser.id))
    }
  }, [dispatch, currentUser?.id])

  const handleTaskClick = (taskId: number) => {
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null)
    } else {
      setSelectedTaskId(taskId)
      if (!aiSolutions[taskId]) {
        dispatch(fetchAiSolution(taskId))
      }
    }
  }

  return (
    <div>
      <h2>Задачи</h2>
      {loading && <p>Загрузка...</p>}
      {error && <p className="error">{error}</p>}
      <ul className="task-list">
        {items.map((t: Task) => (
          <li key={t.id} className="task">
            <div
              onClick={() => handleTaskClick(t.id)}
              style={{ cursor: 'pointer', flex: 1 }}
            >
              <h3>{t.title}</h3>
              <p>{t.subject} — {t.dueDate}</p>
              {t.notes && <p className="task-notes">Заметки: {t.notes}</p>}

              {selectedTaskId === t.id && (
                <div className="ai-solution">
                  <h4>🤖 AI-решение:</h4>
                  {loadingAiSolution ? (
                    <p className="ai-loading">⏳ Генерация решения...</p>
                  ) : aiSolutions[t.id] ? (
                    <p className={
                      aiSolutions[t.id].includes('Ой, ошибка') ||
                      aiSolutions[t.id].includes('❌')
                        ? 'ai-error'
                        : ''
                    }>{aiSolutions[t.id]}</p>
                  ) : (
                    <p className="ai-error">❌ Решение недоступно</p>
                  )}
                </div>
              )}
            </div>
            <div className="task-actions">
              <Link to={`/tasks/${t.id}/edit`}>Редактировать</Link>
              <button onClick={(e) => {
                e.stopPropagation()
                dispatch(deleteTask(t.id))
              }}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

