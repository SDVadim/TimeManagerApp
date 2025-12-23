#!/bin/bash

echo "Запуск StudyFlow (PostgreSQL + Backend + Frontend)"
echo ""

echo "Остановка старых процессов..."
pkill -9 -f "ts-node-dev" 2>/dev/null
pkill -9 -f "vite" 2>/dev/null
pkill -9 -f "json-server" 2>/dev/null
sleep 2

echo "Запуск PostgreSQL..."
docker-compose up -d
sleep 5

if ! docker ps | grep -q studyflow_postgres; then
    echo "ОШИБКА: PostgreSQL не запустился"
    exit 1
fi
echo "PostgreSQL запущен"

echo "Инициализация таблиц..."
docker exec -i studyflow_postgres psql -U studyflow -d studyflow < server/init.sql 2>/dev/null
if [ $? -eq 0 ]; then
    echo "Таблицы инициализированы"
else
    echo "Таблицы уже существуют"
fi

if [ ! -d "server/node_modules" ]; then
    echo "Установка зависимостей backend..."
    cd server && npm install && cd ..
fi

echo "Запуск Backend API..."
(cd server && npm run dev > /tmp/studyflow-backend.log 2>&1) &
BACKEND_PID=$!
sleep 4

if curl -s http://localhost:4000/health | grep -q "ok"; then
    echo "Backend запущен (PID: $BACKEND_PID)"
else
    echo "ОШИБКА: Backend не запустился"
    echo "Логи: /tmp/studyflow-backend.log"
    cat /tmp/studyflow-backend.log
    exit 1
fi

echo "Запуск Frontend..."
npm run dev > /tmp/studyflow-frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Ожидание запуска Frontend..."
for i in {1..15}; do
    sleep 1
    if lsof -ti:5173 > /dev/null 2>&1 || lsof -ti:5174 > /dev/null 2>&1 || lsof -ti:5175 > /dev/null 2>&1 || lsof -ti:5176 > /dev/null 2>&1; then
        break
    fi
done

VITE_PORT=$(lsof -ti:5173 > /dev/null 2>&1 && echo "5173" || lsof -ti:5174 > /dev/null 2>&1 && echo "5174" || lsof -ti:5175 > /dev/null 2>&1 && echo "5175" || lsof -ti:5176 > /dev/null 2>&1 && echo "5176" || lsof -ti:5177 > /dev/null 2>&1 && echo "5177" || echo "unknown")

if [ "$VITE_PORT" != "unknown" ]; then
    echo "Frontend запущен (PID: $FRONTEND_PID, Port: $VITE_PORT)"
else
    echo "ВНИМАНИЕ: Frontend не запустился"
    echo "Логи: /tmp/studyflow-frontend.log"
fi

echo "$BACKEND_PID" > /tmp/studyflow_backend.pid
echo "$FRONTEND_PID" > /tmp/studyflow_frontend.pid

echo ""
echo "Система запущена"
echo "PostgreSQL: localhost:5432"
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:$VITE_PORT"
echo ""
echo "Остановка: ./stop-postgres.sh"
echo ""

