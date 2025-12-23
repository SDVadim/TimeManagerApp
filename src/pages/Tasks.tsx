import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchTasks, deleteTask, Task } from '../store/tasksSlice'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../utils/api'

export default function Tasks() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector((s) => s.tasks)
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchTasks(currentUser.id))
    }
  }, [dispatch, currentUser?.id])

  return (
    <div>
      <h2>Задачи</h2>
      {loading && <p>Загрузка...</p>}
      {error && <p className="error">{error}</p>}
      <ul className="task-list">
        {items.map((t: Task) => (
          <li key={t.id} className="task">
            <div>
              <h3>{t.title}</h3>
              <p>{t.subject} — {t.dueDate}</p>
            </div>
            <div className="task-actions">
              <Link to={`/tasks/${t.id}/edit`}>Редактировать</Link>
              <button onClick={() => dispatch(deleteTask(t.id))}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

