import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TaskManager from './pages/TaskManager'
import Statistics from './pages/Statistics'

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskManager />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

