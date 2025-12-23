import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, setCurrentUser } from '../utils/api'
import '../styles.css'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await registerUser(username, password, displayName)

      if (result.success && result.user) {
        setCurrentUser(result.user)
        navigate('/dashboard')
      } else {
        setError(result.error || 'Ошибка регистрации')
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
          <p className="login-subtitle">Регистрация нового пользователя</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label htmlFor="displayName">Ваше имя</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Например: Иван Иванов"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Минимум 3 символа"
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 3 символа"
              required
              minLength={3}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <div className="login-hint">
            <p>Уже есть аккаунт? <Link to="/login" className="link">Войти</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}

