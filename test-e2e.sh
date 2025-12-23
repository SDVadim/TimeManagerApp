#!/bin/bash

echo "StudyFlow - E2E тесты (Cypress)"
echo ""

echo "Проверка сервисов..."

if ! docker ps | grep -q studyflow_postgres; then
    echo "ОШИБКА: PostgreSQL не запущен"
    echo "Запустите: ./start-all.sh"
    exit 1
fi
echo "PostgreSQL запущен"

if ! curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "ОШИБКА: Backend API не доступен"
    echo "Запустите: ./start-all.sh"
    exit 1
fi
echo "Backend API работает"

FRONTEND_PORT=""
for port in 5173 5174 5175 5176 5177; do
    if lsof -ti:$port > /dev/null 2>&1; then
        FRONTEND_PORT=$port
        break
    fi
done

if [ -z "$FRONTEND_PORT" ]; then
    echo "ОШИБКА: Frontend не запущен"
    echo "Запустите: ./start-all.sh"
    exit 1
fi
echo "Frontend работает на порту $FRONTEND_PORT"

echo ""
echo "Запуск E2E тестов..."
echo ""

if [ "$1" == "--headed" ]; then
    echo "Запуск в режиме с интерфейсом..."
    npx cypress open
elif [ "$1" == "--ui" ]; then
    echo "Запуск Cypress Test Runner..."
    npx cypress open
else
    echo "Запуск в headless режиме..."
    npx cypress run
fi

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "Все тесты пройдены успешно"
else
    echo "Некоторые тесты провалились"
    echo ""
    echo "Видео: cypress/videos/"
    echo "Скриншоты: cypress/screenshots/"
fi

exit $EXIT_CODE

