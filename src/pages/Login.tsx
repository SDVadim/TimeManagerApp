import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authenticateUser, setCurrentUser } from '../utils/api'
import '../styles.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await authenticateUser(username, password)
      if (user) {
        setCurrentUser(user)
        navigate('/dashboard')
      } else {
        setError('Неверный логин или пароль')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">📚 StudyFlow</h1>
          <p className="login-subtitle">Управление задачами и дедлайнами</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Логин</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите логин"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>

          <div className="login-hint">
            <p>Нет аккаунта? <Link to="/register" className="link">Зарегистрироваться</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}

