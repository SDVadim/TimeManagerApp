/// <reference types="cypress" />

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/')
  cy.get('input[type="text"]').type(username)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url({ timeout: 10000 }).should('include', '/dashboard')
})

// Команда для регистрации
Cypress.Commands.add('register', (username: string, password: string, displayName: string) => {
  cy.visit('/register')
  cy.get('input#displayName').type(displayName)
  cy.get('input#username').type(username)
  cy.get('input#password').type(password)
  cy.get('button[type="submit"]').click()
  cy.url({ timeout: 10000 }).should('include', '/dashboard')
})

// Команда для создания задачи
Cypress.Commands.add('createTask', (
  title: string,
  subject?: string,
  dueDate?: string,
  notes?: string
) => {
  cy.contains('Добавить задачу').click()
  cy.get('input[name="title"]').type(title)

  if (subject) {
    cy.get('input[name="subject"]').type(subject)
  }

  if (dueDate) {
    cy.get('input[name="dueDate"]').type(dueDate)
  }

  if (notes) {
    cy.get('textarea[name="notes"]').type(notes)
  }

  cy.get('button[type="submit"]').click()
  cy.wait(500)
})

// Типы для TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Войти в систему
       * @example cy.login('testuser', 'test123')
       */
      login(username: string, password: string): Chainable<void>

      /**
       * Зарегистрировать нового пользователя
       * @example cy.register('testuser', 'test123', 'Test User')
       */
      register(username: string, password: string, displayName: string): Chainable<void>

      /**
       * Создать задачу через UI
       * @example cy.createTask('Моя задача', 'Математика', '2025-12-31', 'Заметки')
       */
      createTask(title: string, subject?: string, dueDate?: string, notes?: string): Chainable<void>
    }
  }
}

export {}

