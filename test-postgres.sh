#!/bin/bash

echo "Тестирование PostgreSQL интеграции"
echo ""

echo "1. Проверка Docker контейнера..."
if docker ps --format '{{.Names}}' | grep -q studyflow_postgres; then
    echo "   PostgreSQL контейнер запущен"
else
    echo "   ОШИБКА: PostgreSQL контейнер не запущен"
    echo "   Запуск: docker-compose up -d"
    exit 1
fi

echo ""
echo "2. Проверка таблиц в БД..."
TABLES=$(docker exec studyflow_postgres psql -U studyflow -d studyflow -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
if [ "$TABLES" -ge "2" ]; then
    echo "   Таблицы созданы ($TABLES таблиц)"
    docker exec studyflow_postgres psql -U studyflow -d studyflow -c "\dt" 2>/dev/null | grep -E "users|tasks"
else
    echo "   ОШИБКА: Таблицы не созданы"
    exit 1
fi

echo ""
echo "3. Проверка Backend API..."
HEALTH=$(curl -s http://localhost:4000/health 2>/dev/null)
if echo "$HEALTH" | grep -q "ok"; then
    echo "   Backend API работает"
    echo "   Response: $HEALTH"
else
    echo "   ОШИБКА: Backend API не отвечает"
    echo "   Запуск: cd server && npm run dev"
    exit 1
fi

echo ""
echo "4. Тест регистрации пользователя..."
RANDOM_USER="testuser_$(date +%s)"
REGISTER_RESULT=$(curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$RANDOM_USER\",\"password\":\"test123\",\"displayName\":\"Test User\"}")

if echo "$REGISTER_RESULT" | grep -q "success"; then
    echo "   Регистрация работает"
    echo "   User: $RANDOM_USER"
else
    echo "   ВНИМАНИЕ: Регистрация: $REGISTER_RESULT"
fi

echo ""
echo "5. Тест входа..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}')

if echo "$LOGIN_RESULT" | grep -q "success"; then
    echo "   Вход работает"
    echo "   Response: $LOGIN_RESULT"
else
    echo "   ВНИМАНИЕ: Вход: $LOGIN_RESULT"
fi

echo ""
echo "6. Проверка Frontend..."
if lsof -i :5173 > /dev/null 2>&1 || lsof -i :5174 > /dev/null 2>&1 || lsof -i :5175 > /dev/null 2>&1 || lsof -i :5176 > /dev/null 2>&1; then
    VITE_PORT=$(lsof -ti:5173 > /dev/null 2>&1 && echo "5173" || lsof -ti:5174 > /dev/null 2>&1 && echo "5174" || lsof -ti:5175 > /dev/null 2>&1 && echo "5175" || lsof -ti:5176 > /dev/null 2>&1 && echo "5176")
    echo "   Frontend запущен на порту $VITE_PORT"
else
    echo "   ВНИМАНИЕ: Frontend не запущен"
    echo "   Запуск: npm run dev"
fi

echo ""
echo "Тестирование завершено"
echo ""
echo "Endpoints:"
echo "   Backend:  http://localhost:4000"
echo "   Frontend: http://localhost:${VITE_PORT:-5173}"
echo ""

