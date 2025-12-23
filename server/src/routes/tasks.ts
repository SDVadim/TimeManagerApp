import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// Получить все задачи пользователя
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await query(
      'SELECT * FROM tasks WHERE user_id = $1 AND archived = false ORDER BY created_at DESC',
      [userId]
    );

    const tasks = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      subject: row.subject,
      dueDate: row.due_date,
      done: row.done,
      notes: row.notes,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      archived: row.archived,
      archivedAt: row.archived_at
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Получить архивированные задачи
router.get('/archived', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await query(
      'SELECT * FROM tasks WHERE user_id = $1 AND archived = true ORDER BY archived_at DESC',
      [userId]
    );

    const tasks = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      subject: row.subject,
      dueDate: row.due_date,
      done: row.done,
      notes: row.notes,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      archived: row.archived,
      archivedAt: row.archived_at
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching archived tasks:', error);
    res.status(500).json({ error: 'Failed to fetch archived tasks' });
  }
});

// Создать новую задачу
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, title, subject, dueDate, notes } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required' });
    }

    const result = await query(
      `INSERT INTO tasks (user_id, title, subject, due_date, notes, done, archived, created_at)
       VALUES ($1, $2, $3, $4, $5, false, false, NOW())
       RETURNING *`,
      [userId, title, subject || null, dueDate || null, notes || null]
    );

    const task = result.rows[0];

    res.status(201).json({
      id: task.id,
      userId: task.user_id,
      title: task.title,
      subject: task.subject,
      dueDate: task.due_date,
      done: task.done,
      notes: task.notes,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      archived: task.archived,
      archivedAt: task.archived_at
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Обновить задачу
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, subject, dueDate, done, notes } = req.body;

    // Если задача помечена как выполненная, устанавливаем completedAt
    const completedAt = done ? 'NOW()' : 'NULL';

    const result = await query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           subject = $2,
           due_date = $3,
           done = COALESCE($4, done),
           notes = $5,
           completed_at = CASE WHEN $4 = true THEN COALESCE(completed_at, NOW()) ELSE NULL END
       WHERE id = $6
       RETURNING *`,
      [title, subject, dueDate, done, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = result.rows[0];

    res.json({
      id: task.id,
      userId: task.user_id,
      title: task.title,
      subject: task.subject,
      dueDate: task.due_date,
      done: task.done,
      notes: task.notes,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      archived: task.archived,
      archivedAt: task.archived_at
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Архивировать задачу
router.post('/:id/archive', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE tasks 
       SET archived = true, archived_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, id: parseInt(id) });
  } catch (error) {
    console.error('Error archiving task:', error);
    res.status(500).json({ error: 'Failed to archive task' });
  }
});

// Удалить задачу
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;

