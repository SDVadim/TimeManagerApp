# StudyFlow - Система управления задачами

Веб-приложение для управления учебными задачами с React, Redux, Node.js и PostgreSQL.

## Быстрый запуск

### Требования
- Node.js 18+
- Docker Desktop
- npm

### Установка

```bash
npm install
cd server && npm install && cd ..
./start-all.sh
```

Откройте: http://localhost:5173

## Архитектура

**Frontend:** React 18 + TypeScript + Redux Toolkit + Vite  
**Backend:** Node.js + Express + TypeScript + PostgreSQL  
**Database:** PostgreSQL 15 в Docker

## Структура

```
V2/
├── src/              # Frontend
├── server/           # Backend
├── docker-compose.yml
├── start-all.sh
├── stop-postgres.sh
└── README.md
```

## Endpoints

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- PostgreSQL: localhost:5432

## API

### Auth
- POST /api/auth/register - Регистрация
- POST /api/auth/login - Вход

### Tasks
- GET /api/tasks?userId=1 - Список задач
- POST /api/tasks - Создать
- PUT /api/tasks/:id - Обновить
- POST /api/tasks/:id/archive - Архивировать
- DELETE /api/tasks/:id - Удалить

## Управление

```bash
./start-all.sh      # Запуск
```
```bash
./stop-postgres.sh  # Остановка
```
```bash
./test-postgres.sh  # Тесты
```

### GUI клиенты
- IntelliJ IDEA Database Tool
- DBeaver: `brew install --cask dbeaver-community`
- TablePlus: `brew install --cask tableplus`

## Тесты

### E2E тесты (Cypress)
```bash
npm run test:e2e       # Headless
```