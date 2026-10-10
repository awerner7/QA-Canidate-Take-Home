/**
 * Exercise 2 — Filter and search
 */
describe('Exercise 2: Filter and search', () => {
  beforeEach(() => {
    cy.visitTaskBoard();
  });

  it('filters when status changes to Completed', () => {
    // TODO 1: select "completed" in [data-cy="status-filter"]
    // TODO 2: assert every visible [data-cy="task-status"] contains "Completed"
    //         (or assert empty-state if none exist)
    cy.log('Replace this log with your steps');
  });

  it('searches by title text', () => {
    // Seeded task: "Review pull request"
    // Search is case-sensitive. Type the full word "Review".
    // A 1–3 character query can finish out of order if you type quickly.
    // TODO 1: type "Review" into [data-cy="search-input"]
    // TODO 2: assert at least one [data-cy="task-title"] contains "Review"
    cy.log('Replace this log with your steps');
  });
});
