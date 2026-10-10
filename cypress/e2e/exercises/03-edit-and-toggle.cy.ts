/**
 * Exercise 3 — Edit and toggle
 */
describe('Exercise 3: Edit and toggle', () => {
  beforeEach(() => {
    cy.visitTaskBoard();
  });

  it('edits an existing task title', () => {
    // TODO: create or pick a task, click Edit, change title, Save, assert new title
    cy.log('Replace this log with your steps');
  });

  it('toggles a task complete', () => {
    // TODO: click [data-cy="task-complete-toggle"] and assert [data-cy="task-status"]
    // If the result does not match the acceptance criteria, leave a comment instead of weakening the assertion.
    cy.log('Replace this log with your steps');
  });
});
