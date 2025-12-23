# StudyFlow - Система управления задачами

Веб-приложение для управления учебными задачами и дедлайнами. Позволяет студентам создавать задачи, отслеживать дедлайны, отмечать выполненные задачи и просматривать статистику. Приложение построено на React + Redux на фронтенде и Node.js + Express + PostgreSQL на бэкенде.

[**Презентация**](https://sdvadim.github.io/Student_time_manager/)

---

## Получение исходников

```bash
git clone https://github.com/your-username/studyflow.git
cd studyflow
```

---

## Требования

### Обязательные компоненты

**1. Node.js**
- Версия: Node.js 18 LTS или выше

**2. Docker Desktop**
- Для запуска PostgreSQL в контейнере


### База данных

**PostgreSQL 15**
- Запускается через Docker
---

## Запуск проекта

### 1. Установка зависимостей

```bash
# Установка зависимостей frontend
npm install

# Установка зависимостей backend
cd server
npm install
cd ..
```

### 2. Настройка переменных окружения

Создайте файл `server/.env`:

```env
PORT=4000
DATABASE_URL=postgresql://studyflow:studyflow123@localhost:5432/studyflow
NODE_ENV=development
```

**Значения по умолчанию:**
- `PORT` - порт backend сервера (4000)
- `DATABASE_URL` - строка подключения к PostgreSQL (используется при локальном запуске через Docker)
- `NODE_ENV` - режим работы (development/production)

### 3. Запуск базы данных

**Через Docker**

```bash
# Запуск PostgreSQL в Docker контейнере
docker-compose up -d

# Проверка что контейнер запущен
docker ps | grep studyflow_postgres
```

База данных автоматически инициализируется с таблицами `users` и `tasks`.

### 4. Запуск приложения

**Автоматический запуск (все сервисы):**

```bash
./start-all.sh
```

Этот скрипт запускает:
- PostgreSQL (через Docker)
- Backend API (порт 4000)
- Frontend dev server (порт 5173)

**Ручной запуск:**

```bash
# Терминал 1: Backend
cd server
npm run dev

# Терминал 2: Frontend
npm run dev
```

### 5. Открытие приложения

После успешного запуска откройте браузер:

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:4000  
**API Health Check:** http://localhost:4000/health

---

## Основной бизнес-кейс

### Сценарий использования: Управление учебными задачами

**1. Регистрация пользователя**
- Откройте http://localhost:5173
- Нажмите "Зарегистрироваться"
- Заполните форму:
  - Имя: "Иван Петров"
  - Логин: "ivan"
  - Пароль: "pass123"
- Нажмите "Зарегистрироваться"

**2. Создание задачи**
- После входа на главной странице нажмите "Редактировать задачи"
- Нажмите "Добавить задачу"
- Заполните форму:
  - Название: "Сдать лабораторную работу по математике"
  - Предмет: "Математика"
  - Дедлайн: выберите дату (например, через неделю)
  - Заметки: "Задачи 1-10 из учебника"
- Нажмите "Сохранить"

**3. Управление задачами**
- Отметьте задачу как выполненную (чекбокс)
- Отредактируйте задачу (кнопка "Редактировать")
- Архивируйте ненужные задачи (кнопка "Архивировать")
- Удалите задачу (кнопка "Удалить")

**4. Просмотр статистики**
- Вернитесь на главную страницу (Dashboard)
- Нажмите "Статистика"
- Просмотрите:
  - Общее количество задач
  - Количество выполненных задач
  - Количество задач в работе
  - График выполнения задач

**5. Просмотр данных в базе**

Подключитесь к PostgreSQL для проверки сохраненных данных:

```bash
# Подключение к БД через Docker
docker exec -it studyflow_postgres psql -U studyflow -d studyflow

# Просмотр пользователей
SELECT id, username, display_name FROM users;

# Просмотр задач
SELECT id, title, subject, due_date, done FROM tasks;

# Выход
\q
```

---

## Структура приложения

```
V2/
├── src/                          # Frontend исходники
│   ├── main.tsx                  # Точка входа React приложения
│   ├── App.tsx                   # Главный компонент с роутингом
│   ├── styles.css                # Глобальные стили
│   │
│   ├── pages/                    # Страницы приложения
│   │   ├── Login.tsx             # Страница входа
│   │   ├── Register.tsx          # Страница регистрации
│   │   ├── Dashboard.tsx         # Главная страница (дашборд)
│   │   ├── TaskManager.tsx       # Управление задачами (CRUD)
│   │   ├── Tasks.tsx             # Список задач
│   │   ├── TaskForm.tsx          # Форма создания/редактирования задачи
│   │   ├── Statistics.tsx        # Страница статистики
│   │   ├── Home.tsx              # Домашняя страница
│   │   └── About.tsx             # О приложении
│   │
│   ├── store/                    # Redux store
│   │   ├── index.ts              # Настройка store, hooks (useAppDispatch, useAppSelector)
│   │   ├── tasksSlice.ts         # Slice для управления задачами (actions, reducers, thunks)
│   │   └── tasksSlice.test.ts    # Тесты для tasksSlice
│   │
│   └── utils/                    # Утилиты
│       ├── api.ts                # API клиент (axios), функции для работы с backend
│       └── auth.ts               # Утилиты аутентификации (устаревший, заменен на api.ts)
│
├── server/                       # Backend исходники
│   ├── src/
│   │   ├── server.ts             # Express сервер, middleware, запуск
│   │   ├── db.ts                 # Подключение к PostgreSQL (pg pool)
│   │   └── routes/               # API маршруты
│   │       ├── auth.ts           # Маршруты аутентификации (register, login)
│   │       └── tasks.ts          # Маршруты для задач (CRUD операции)
│   │
│   ├── init.sql                  # SQL скрипт инициализации БД (создание таблиц)
│   ├── package.json              # Зависимости backend
│   ├── tsconfig.json             # TypeScript конфигурация backend
│   └── .env                      # Переменные окружения backend
│
├── cypress/                      # E2E тесты
│   ├── e2e/
│   │   └── studyflow.cy.ts       # Cypress тесты (регистрация, вход, CRUD задач)
│   └── support/
│       └── commands.ts           # Кастомные команды Cypress
│
├── docker-compose.yml            # Docker конфигурация для PostgreSQL
├── cypress.config.ts             # Конфигурация Cypress
├── vite.config.ts                # Конфигурация Vite (frontend bundler)
├── tsconfig.json                 # TypeScript конфигурация frontend
├── package.json                  # Зависимости и скрипты frontend
│
├── start-all.sh                  # Скрипт запуска всех сервисов
├── stop-postgres.sh              # Скрипт остановки всех сервисов
├── test-postgres.sh              # Скрипт тестирования интеграции
├── test-e2e.sh                   # Скрипт запуска E2E тестов
├── migrate-data.js               # Скрипт миграции данных из db.json в PostgreSQL
│
└── README.md                     # Документация
```

### Описание ключевых модулей

**Frontend:**
- `src/store/tasksSlice.ts` - Redux slice с async thunks для работы с API задач (fetchTasks, createTask, updateTask, deleteTask, archiveTask)
- `src/utils/api.ts` - Централизованный API клиент с функциями для аутентификации и управления задачами
- `src/pages/` - React компоненты страниц с использованием React Router
- `src/main.tsx` - Инициализация React, Redux Provider, React Router

**Backend:**
- `server/src/server.ts` - Express приложение с middleware (cors, json parser), подключение маршрутов
- `server/src/db.ts` - Connection pool для PostgreSQL
- `server/src/routes/` - REST API endpoints с бизнес-логикой
- `server/init.sql` - DDL для создания таблиц users и tasks с индексами

**База данных:**
- Таблица `users` - хранение пользователей (id, username, password, display_name, created_at)
- Таблица `tasks` - хранение задач (id, user_id, title, subject, due_date, done, notes, created_at, completed_at, archived, archived_at)
- Индексы для оптимизации запросов по user_id, archived, done

---

## Дополнительные команды

### Тестирование

```bash
# Unit тесты
npm test

# E2E тесты (требуется запущенное приложение)
./test-e2e.sh

# Проверка интеграции с PostgreSQL
./test-postgres.sh
```

### Работа с базой данных

```bash
# Просмотр таблиц
docker exec studyflow_postgres psql -U studyflow -d studyflow -c "\dt"

# Логи PostgreSQL
docker-compose logs -f postgres

# Остановка и удаление данных БД
docker-compose down -v
```
