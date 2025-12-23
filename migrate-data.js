#!/usr/bin/env node
/* eslint-disable no-undef, @typescript-eslint/no-var-requires */

const fs = require('fs');
const { Client } = require('pg');

const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'studyflow',
  user: 'studyflow',
  password: 'studyflow123'
};

async function migrate() {
  console.log('Миграция данных из db.json в PostgreSQL...\n');

  let dbData;
  try {
    const rawData = fs.readFileSync('./db.json', 'utf8');
    dbData = JSON.parse(rawData);
    console.log('db.json прочитан');
  } catch (error) {
    console.error('Ошибка чтения db.json:', error.message);
    return;
  }

  const client = new Client(DB_CONFIG);

  try {
    await client.connect();
    console.log('Подключено к PostgreSQL\n');

    if (dbData.tasks && Array.isArray(dbData.tasks)) {
      console.log(`Найдено задач: ${dbData.tasks.length}`);

      for (const task of dbData.tasks) {
        try {
          await client.query(
            `INSERT INTO tasks (user_id, title, subject, due_date, done, notes, created_at, completed_at, archived, archived_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT DO NOTHING`,
            [
              task.userId || 1,
              task.title || 'Без названия',
              task.subject || null,
              task.dueDate || null,
              task.done || false,
              task.notes || null,
              task.createdAt || new Date().toISOString(),
              task.completedAt || null,
              task.archived || false,
              task.archivedAt || null
            ]
          );
          console.log(`  Задача "${task.title}" мигрирована`);
        } catch (error) {
          console.log(`  Задача "${task.title}" пропущена: ${error.message}`);
        }
      }
    }

    if (dbData.archivedTasks && Array.isArray(dbData.archivedTasks)) {
      console.log(`\nНайдено архивных задач: ${dbData.archivedTasks.length}`);

      for (const task of dbData.archivedTasks) {
        try {
          await client.query(
            `INSERT INTO tasks (user_id, title, subject, due_date, done, notes, created_at, completed_at, archived, archived_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
             ON CONFLICT DO NOTHING`,
            [
              task.userId || 1,
              task.title || 'Без названия',
              task.subject || null,
              task.dueDate || null,
              task.done || false,
              task.notes || null,
              task.createdAt || new Date().toISOString(),
              task.completedAt || null,
              task.archivedAt || new Date().toISOString()
            ]
          );
          console.log(`  Архивная задача "${task.title}" мигрирована`);
        } catch (error) {
          console.log(`  Архивная задача "${task.title}" пропущена: ${error.message}`);
        }
      }
    }

    console.log('\nСтатистика:');

    const tasksResult = await client.query('SELECT COUNT(*) FROM tasks WHERE archived = false');
    console.log(`  Активных задач: ${tasksResult.rows[0].count}`);

    const archivedResult = await client.query('SELECT COUNT(*) FROM tasks WHERE archived = true');
    console.log(`  Архивных задач: ${archivedResult.rows[0].count}`);

    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    console.log(`  Пользователей: ${usersResult.rows[0].count}`);

    console.log('\nМиграция завершена');

  } catch (error) {
    console.error('\nОшибка миграции:', error.message);
  } finally {
    await client.end();
  }
}

// Запуск миграции
migrate().catch(console.error);

