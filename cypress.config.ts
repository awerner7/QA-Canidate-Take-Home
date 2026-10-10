import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    baseUrl: 'http://localhost:5080',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    defaultCommandTimeout: 10000,
  },
});
