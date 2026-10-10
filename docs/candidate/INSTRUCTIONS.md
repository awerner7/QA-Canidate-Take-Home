# QA Assessment: TaskBoard

Welcome. This exercise uses **TaskBoard**, a small task manager, to see how you approach testing a real application. It has two parts. Work through them in order and keep notes as you go.

| Part | What you do | Suggested time |
|------|-------------|----------------|
| 1. Exploratory testing | Test the app against the acceptance criteria and report every defect you find | 45–60 min |
| 2. Cypress exercises | Complete a few simple automated tests (no prior Cypress knowledge expected) | 45–60 min |

You are not expected to finish everything. We care about how you think, how clearly you communicate, and how you prioritise.

In the interview we will ask a few questions about general Cypress knowledge. Please also read about Page Object Models. We may ask a few questions about those as well.

## Getting set up

Prerequisites: [.NET 10 SDK](https://dotnet.microsoft.com/download) and [Node.js 20+](https://nodejs.org/).

```bash
npm install
npm run client:install
npm start
```

Open [http://localhost:5080](http://localhost:5080).

In a second terminal:

```bash
npm run cypress:open
```

The app keeps data **in memory**. Restarting the API restores the seeded sample tasks.

Optional hot-reload UI (API must also be running):

```bash
npm run api:run      # terminal 1 — http://localhost:5080
npm run client:dev   # terminal 2 — http://localhost:4200 (proxies /api)
```

## Part 1: Exploratory testing

1. Read [ACCEPTANCE-CRITERIA.md](./ACCEPTANCE-CRITERIA.md).
2. Exercise the application: happy paths, edge cases, odd inputs, unusual sequences. Reload occasionally. Keep browser DevTools open.
3. Log defects using [BUG-REPORT-TEMPLATE.md](./BUG-REPORT-TEMPLATE.md). Put them in a single file named `BUGS.md` at the repo root.

Keep in mind:

- Not every defect maps to an acceptance criterion. Report risky or inconsistent behaviour even when the criteria are silent, and say why it matters.
- Severity matters. A typo and a data-loss bug are not the same.
- Clear reproduction steps are gold. If something is intermittent, say so.

## Part 2: Cypress exercises

You are not expected to know Cypress already. Run the smoke specs first, then follow [CYPRESS-EXERCISES.md](./CYPRESS-EXERCISES.md).

## Submitting

Zip the repository (without `node_modules`, `bin`, `obj`, or `wwwroot`) or push a branch. Include:

- `BUGS.md`
- completed specs under `cypress/e2e/exercises/`

