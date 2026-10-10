/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Visits the TaskBoard home page and waits for the shell to render.
       */
      visitTaskBoard(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('visitTaskBoard', () => {
  cy.visit('/');
  cy.get('[data-cy="app-brand"]').should('contain.text', 'TaskBoard');
  cy.get('[data-cy="task-form"]').should('be.visible');
});

export {};
