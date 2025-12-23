#!/bin/bash

echo "Остановка StudyFlow..."
echo ""

echo "Остановка процессов..."
pkill -f "ts-node-dev" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "json-server" 2>/dev/null

if [ -f /tmp/studyflow_backend.pid ]; then
    kill $(cat /tmp/studyflow_backend.pid) 2>/dev/null
    rm /tmp/studyflow_backend.pid
fi

if [ -f /tmp/studyflow_vite.pid ]; then
    kill $(cat /tmp/studyflow_vite.pid) 2>/dev/null
    rm /tmp/studyflow_vite.pid
fi

echo "Остановка PostgreSQL..."
docker-compose down

echo ""
echo "Все процессы остановлены"

