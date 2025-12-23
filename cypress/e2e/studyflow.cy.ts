/// <reference types="cypress" />

describe('StudyFlow E2E Tests', () => {
  const baseUrl = 'http://localhost:5173'
  const apiUrl = 'http://localhost:4000'

  const timestamp = Date.now()
  const testUser = {
    username: `testuser_${timestamp}`,
    password: 'test123',
    displayName: 'Test User E2E'
  }

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  describe('1. Страница входа', () => {
    it('должна отображать форму входа', () => {
      cy.visit(baseUrl)
      cy.contains('StudyFlow').should('be.visible')
      cy.contains('Управление задачами и дедлайнами').should('be.visible')
      cy.get('input[type="text"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('contain', 'Войти')
    })

    it('должна показывать ошибку при неверных данных', () => {
      cy.visit(baseUrl)
      cy.get('input[type="text"]').type('wronguser')
      cy.get('input[type="password"]').type('wrongpass')
      cy.get('button[type="submit"]').click()

      // Ждем ответ от сервера
      cy.wait(500)
      cy.contains('Неверный логин или пароль', { timeout: 5000 }).should('be.visible')
    })

    it('должна иметь ссылку на регистрацию', () => {
      cy.visit(baseUrl)
      cy.contains('Зарегистрироваться').should('be.visible').click()
      cy.url().should('include', '/register')
    })
  })

  describe('2. Регистрация пользователя', () => {
    it('должна отображать форму регистрации', () => {
      cy.visit(`${baseUrl}/register`)
      cy.contains('Регистрация нового пользователя').should('be.visible')
      cy.get('input#displayName').should('be.visible')
      cy.get('input#username').should('be.visible')
      cy.get('input#password').should('be.visible')
      cy.get('button[type="submit"]').should('contain', 'Зарегистрироваться')
    })

    it('должна показывать ошибки валидации', () => {
      cy.visit(`${baseUrl}/register`)

      // Пустая форма
      cy.get('input#displayName').type('AB')
      cy.get('input#displayName').clear()

      // Короткое имя пользователя
      cy.get('input#username').type('ab')
      cy.get('button[type="submit"]').click()

      // HTML5 валидация сработает
      cy.get('input#username:invalid').should('exist')
    })

    it('должна успешно регистрировать нового пользователя', () => {
      cy.visit(`${baseUrl}/register`)

      cy.get('input#displayName').type(testUser.displayName)
      cy.get('input#username').type(testUser.username)
      cy.get('input#password').type(testUser.password)
      cy.get('button[type="submit"]').click()

      // Должны попасть на dashboard
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
      cy.contains(testUser.displayName, { timeout: 5000 }).should('be.visible')
    })

    it('не должна регистрировать пользователя с существующим именем', () => {
      // Сначала регистрируем пользователя
      cy.visit(`${baseUrl}/register`)
      cy.get('input#displayName').type(testUser.displayName)
      cy.get('input#username').type(testUser.username)
      cy.get('input#password').type(testUser.password)
      cy.get('button[type="submit"]').click()
      cy.url({ timeout: 10000 }).should('include', '/dashboard')

      // Выходим
      cy.contains('Выход').click()
      cy.url().should('include', '/login')

      // Пытаемся зарегистрировать снова с тем же username
      cy.contains('Зарегистрироваться').click()
      cy.get('input#displayName').type('Another User')
      cy.get('input#username').type(testUser.username)
      cy.get('input#password').type('password123')
      cy.get('button[type="submit"]').click()

      cy.contains('Пользователь с таким именем уже существует', { timeout: 5000 }).should('be.visible')
    })
  })

  describe('3. Вход в систему', () => {
    before(() => {
      // Создаем тестового пользователя через API
      cy.request('POST', `${apiUrl}/api/auth/register`, {
        username: testUser.username,
        password: testUser.password,
        displayName: testUser.displayName
      })
    })

    it('должна успешно входить с правильными данными', () => {
      cy.visit(baseUrl)
      cy.get('input[type="text"]').type(testUser.username)
      cy.get('input[type="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()

      cy.url({ timeout: 10000 }).should('include', '/dashboard')
      cy.contains(testUser.displayName, { timeout: 5000 }).should('be.visible')
    })
  })

  describe('4. Dashboard', () => {
    beforeEach(() => {
      // Входим перед каждым тестом
      cy.visit(baseUrl)
      cy.get('input[type="text"]').type(testUser.username)
      cy.get('input[type="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
    })

    it('должен отображать основные элементы', () => {
      cy.contains(`Привет, ${testUser.displayName}`, { timeout: 5000 }).should('be.visible')
      cy.contains('Редактировать задачи').should('be.visible')
      cy.contains('Статистика').should('be.visible')
      cy.contains('Выход').should('be.visible')
    })

    it('должен показывать сообщение о пустом списке задач', () => {
      cy.contains('Нет задач', { timeout: 5000 }).should('be.visible')
    })

    it('должен переходить на страницу задач', () => {
      cy.contains('Редактировать задачи').click()
      cy.url().should('include', '/tasks')
    })

    it('должен переходить на страницу статистики', () => {
      cy.contains('Статистика').click()
      cy.url().should('include', '/statistics')
    })

    it('должен выходить из системы', () => {
      cy.contains('Выход').click()
      cy.url().should('include', '/login')
    })
  })

  describe('5. Управление задачами (CRUD)', () => {
    beforeEach(() => {
      // Входим и переходим на страницу задач
      cy.visit(baseUrl)
      cy.get('input[type="text"]').type(testUser.username)
      cy.get('input[type="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
      cy.contains('Редактировать задачи').click()
      cy.url().should('include', '/tasks')
    })

    it('должен создавать новую задачу', () => {
      cy.contains('Добавить задачу').click()

      cy.get('input[name="title"]').type('Тестовая задача')
      cy.get('input[name="subject"]').type('Математика')
      cy.get('input[name="dueDate"]').type('2025-12-31')
      cy.get('textarea[name="notes"]').type('Важная задача для теста')

      cy.get('button[type="submit"]').click()

      // Проверяем что задача появилась
      cy.contains('Тестовая задача', { timeout: 5000 }).should('be.visible')
      cy.contains('Математика').should('be.visible')
    })

    it('должен редактировать существующую задачу', () => {
      // Создаем задачу
      cy.contains('Добавить задачу').click()
      cy.get('input[name="title"]').type('Задача для редактирования')
      cy.get('button[type="submit"]').click()
      cy.wait(500)

      // Находим и редактируем
      cy.contains('Задача для редактирования').should('be.visible')
      cy.contains('Задача для редактирования')
        .parent()
        .parent()
        .within(() => {
          cy.contains('button', 'Редактировать').click()
        })

      cy.get('input[name="title"]').clear().type('Отредактированная задача')
      cy.get('input[name="subject"]').type('Физика')
      cy.get('button[type="submit"]').click()

      cy.contains('Отредактированная задача', { timeout: 5000 }).should('be.visible')
      cy.contains('Физика').should('be.visible')
    })

    it('должен отмечать задачу как выполненную', () => {
      // Создаем задачу
      cy.contains('Добавить задачу').click()
      cy.get('input[name="title"]').type('Задача для завершения')
      cy.get('button[type="submit"]').click()
      cy.wait(500)

      // Отмечаем как выполненную
      cy.contains('Задача для завершения')
        .parent()
        .parent()
        .within(() => {
          cy.get('input[type="checkbox"]').check()
        })

      // Проверяем что задача помечена
      cy.wait(500)
      cy.contains('Задача для завершения')
        .parent()
        .parent()
        .within(() => {
          cy.get('input[type="checkbox"]').should('be.checked')
        })
    })

    it('должен удалять задачу', () => {
      // Создаем задачу
      cy.contains('Добавить задачу').click()
      cy.get('input[name="title"]').type('Задача для удаления')
      cy.get('button[type="submit"]').click()
      cy.wait(500)

      // Удаляем
      cy.contains('Задача для удаления')
        .parent()
        .parent()
        .within(() => {
          cy.contains('button', 'Удалить').click()
        })

      // Подтверждаем в диалоге
      cy.on('window:confirm', () => true)

      // Проверяем что задача удалена
      cy.wait(500)
      cy.contains('Задача для удаления').should('not.exist')
    })

    it('должен архивировать задачу', () => {
      // Создаем задачу
      cy.contains('Добавить задачу').click()
      cy.get('input[name="title"]').type('Задача для архива')
      cy.get('button[type="submit"]').click()
      cy.wait(500)

      // Архивируем
      cy.contains('Задача для архива')
        .parent()
        .parent()
        .within(() => {
          cy.contains('button', 'Архивировать').click()
        })

      // Проверяем что задача исчезла из активных
      cy.wait(500)
      cy.contains('Задача для архива').should('not.exist')
    })
  })

  describe('6. Статистика', () => {
    beforeEach(() => {
      // Входим
      cy.visit(baseUrl)
      cy.get('input[type="text"]').type(testUser.username)
      cy.get('input[type="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
    })

    it('должна отображать статистику задач', () => {
      cy.contains('Статистика').click()
      cy.url().should('include', '/statistics')

      cy.contains('Статистика задач').should('be.visible')
      cy.contains('Всего задач').should('be.visible')
      cy.contains('Выполнено').should('be.visible')
      cy.contains('В работе').should('be.visible')
    })
  })

  describe('7. Полный пользовательский сценарий', () => {
    const newUser = {
      username: `fulltest_${Date.now()}`,
      password: 'test123',
      displayName: 'Full Test User'
    }

    it('должен выполнить полный цикл: регистрация → создание задач → выполнение → статистика', () => {
      // 1. Регистрация
      cy.visit(`${baseUrl}/register`)
      cy.get('input#displayName').type(newUser.displayName)
      cy.get('input#username').type(newUser.username)
      cy.get('input#password').type(newUser.password)
      cy.get('button[type="submit"]').click()
      cy.url({ timeout: 10000 }).should('include', '/dashboard')

      // 2. Переход к задачам
      cy.contains('Редактировать задачи').click()

      // 3. Создание трех задач
      const tasks = [
        { title: 'Задача 1', subject: 'Математика' },
        { title: 'Задача 2', subject: 'Физика' },
        { title: 'Задача 3', subject: 'Химия' }
      ]

      tasks.forEach(task => {
        cy.contains('Добавить задачу').click()
        cy.get('input[name="title"]').type(task.title)
        cy.get('input[name="subject"]').type(task.subject)
        cy.get('button[type="submit"]').click()
        cy.wait(500)
      })

      // 4. Проверяем что все задачи созданы
      tasks.forEach(task => {
        cy.contains(task.title).should('be.visible')
      })

      // 5. Отмечаем первую задачу как выполненную
      cy.contains('Задача 1')
        .parent()
        .parent()
        .within(() => {
          cy.get('input[type="checkbox"]').check()
        })
      cy.wait(500)

      // 6. Возвращаемся на dashboard
      cy.contains('Назад к главной').click()
      cy.url().should('include', '/dashboard')

      // 7. Проверяем статистику на dashboard
      cy.contains('у вас 2 задачи в работе').should('be.visible')

      // 8. Переходим на страницу статистики
      cy.contains('Статистика').click()
      cy.contains('Всего задач: 3').should('be.visible')
      cy.contains('Выполнено: 1').should('be.visible')
      cy.contains('В работе: 2').should('be.visible')

      // 9. Выход
      cy.contains('Назад к главной').click()
      cy.contains('Выход').click()
      cy.url().should('include', '/login')
    })
  })

  describe('8. Защита маршрутов', () => {
    it('должен перенаправлять на login при попытке доступа к защищенным страницам', () => {
      cy.visit(`${baseUrl}/dashboard`)
      cy.url().should('include', '/login')

      cy.visit(`${baseUrl}/tasks`)
      cy.url().should('include', '/login')

      cy.visit(`${baseUrl}/statistics`)
      cy.url().should('include', '/login')
    })
  })
})


