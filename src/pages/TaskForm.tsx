import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { createTask, updateTask } from '../store/tasksSlice'
import { getCurrentUser } from '../utils/api'

export default function TaskForm() {
  const { id } = useParams()
  const editId = id ? Number(id) : null
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const task = useAppSelector((s) => s.tasks.items.find((t) => t.id === editId))

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    if (task) {
      setTitle(task.title)
      setSubject(task.subject || '')
      setDueDate(task.dueDate || '')
    }
  }, [task, currentUser, navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      navigate('/login')
      return
    }

    if (editId && task) {
      await dispatch(updateTask({
        ...task,
        title,
        subject,
        dueDate
      }))
    } else {
      await dispatch(createTask({
        userId: currentUser.id,
        title,
        subject,
        dueDate,
        done: false
      }))
    }
    navigate('/tasks')
  }

  return (
    <div>
      <h2>{editId ? 'Редактировать задачу' : 'Создать задачу'}</h2>
      <form onSubmit={onSubmit} className="task-form">
        <label>
          Название
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Предмет
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label>
          Дедлайн
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <div>
          <button type="submit">Сохранить</button>
        </div>
      </form>
    </div>
  )
}

