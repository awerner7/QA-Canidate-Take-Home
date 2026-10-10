describe('TaskBoard smoke', () => {
  it('loads the app shell', () => {
    cy.visitTaskBoard();
    cy.get('[data-cy="app-heading"]').should('be.visible');
    cy.get('[data-cy="task-list"], [data-cy="empty-state"]').should('exist');
  });

  it('shows seeded tasks', () => {
    cy.visitTaskBoard();
    cy.get('[data-cy="task-item"]').should('have.length.at.least', 1);
    cy.contains('[data-cy="task-title"]', 'Review pull request').should('be.visible');
    cy.contains('[data-cy="task-label"]', 'cypress').should('be.visible');
  });
});
