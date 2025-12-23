import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db';

const router = Router();

// Регистрация пользователя
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, displayName } = req.body;

    // Валидация
    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Имя пользователя должно быть не менее 3 символов'
      });
    }

    if (!password || password.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Пароль должен быть не менее 3 символов'
      });
    }

    if (!displayName || displayName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Имя должно быть не менее 2 символов'
      });
    }

    // Проверка существования пользователя
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Пользователь с таким именем уже существует'
      });
    }

    // Создание пользователя
    const result = await query(
      'INSERT INTO users (username, password, display_name) VALUES ($1, $2, $3) RETURNING id, username, display_name',
      [username, password, displayName]
    );

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при регистрации'
    });
  }
});

// Вход пользователя
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Введите имя пользователя и пароль'
      });
    }

    // Поиск пользователя
    const result = await query(
      'SELECT id, username, password, display_name FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Неверное имя пользователя или пароль'
      });
    }

    const user = result.rows[0];

    // Проверка пароля (простое сравнение)
    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        error: 'Неверное имя пользователя или пароль'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при входе'
    });
  }
});

export default router;

