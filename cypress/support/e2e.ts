import './commands';

beforeEach(() => {
  cy.on('window:confirm', () => true);
});
