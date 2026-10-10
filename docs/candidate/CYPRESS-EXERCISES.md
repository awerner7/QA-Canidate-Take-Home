# Cypress Exercises

You do **not** need prior Cypress experience. Learn by reading working examples, then complete the stubs.

## Before you start

1. Start the app (`npm start`) so [http://localhost:5080](http://localhost:5080) is up.
2. Run `npm run cypress:open` → **E2E Testing** → pick a browser.
3. Run **TaskBoard smoke** and confirm it passes.
4. Skim:
   - `cypress/e2e/smoke.cy.ts`
   - `cypress/support/commands.ts`
   - `cypress/support/e2e.ts`

## Commands you need

```ts
cy.visit('/');
cy.visitTaskBoard(); // custom helper
cy.get('[data-cy="task-title-input"]').type('Buy milk');
cy.get('[data-cy="task-labels-input"]').type('shopping');
cy.get('[data-cy="task-submit"]').click();
cy.contains('[data-cy="task-title"]', 'Buy milk').should('be.visible');
cy.contains('[data-cy="task-label"]', 'shopping').should('be.visible');
cy.get('[data-cy="status-filter"]').select('active');
cy.get('[data-cy="search-input"]').type('Review');
```

Notes for newcomers:

- Commands are **queued**, not executed immediately — chain `.should()` / `.then()`.
- Assertions **retry** until they pass or time out. Prefer that over `cy.wait(3000)`.
- Prefer `data-cy` selectors (same convention as Excellence / Aurum).

`window.confirm` is auto-accepted in `cypress/support/e2e.ts`.

## Exercises

| File | Goal |
|------|------|
| `cypress/e2e/exercises/01-create-task.cy.ts` | Create a task via the UI and assert it appears |
| `cypress/e2e/exercises/02-filter-and-search.cy.ts` | Active filter + title search |
| `cypress/e2e/exercises/03-edit-and-toggle.cy.ts` | Edit a title; toggle completion |

Each file has `TODO` comments. Replace the placeholder `cy.log(...)` with real steps.

## Expectations

**Required**

- Exercise 1 fully implemented with a meaningful assertion
- Prefer `data-cy` selectors
- Specs run in Cypress (failing assertions caused by product bugs are OK if you comment what you saw)

**Nice to have**

- Unique titles via `Date.now()`
- Comments noting AC mismatches discovered while automating

**Please avoid**

- Changing application source under `src/` to force green tests
- Hard-coded sleeps when a DOM assertion would do

## Deliverable

Your updated files under `cypress/e2e/exercises/` (and `commands.ts` only if you added helpers).
