/**
 * Exercise 1 — Create a task
 *
 * Tips:
 * - Prefer data-cy selectors (same convention as Excellence / Aurum)
 * - Use .should() assertions
 * - A unique title with Date.now() keeps reruns reliable
 */
describe('Exercise 1: Create task', () => {
  beforeEach(() => {
    cy.visitTaskBoard();
  });

  it('adds a task with a unique title and shows it in the list', () => {
    const title = `Cypress task ${Date.now()}`;

    // TODO 1: type the title into [data-cy="task-title-input"]
    // TODO 2: optionally fill description, labels, priority, or due date
    //         labels input: [data-cy="task-labels-input"]
    // TODO 3: click [data-cy="task-submit"] once
    // TODO 4: assert a [data-cy="task-title"] containing `title` is visible

    cy.log('Replace this log with your steps');
    expect(title.length).to.be.greaterThan(0);
  });
});
