import { defineConfig, devices } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';

// O playwright-bdd lê os .feature e gera os testes do Playwright em .features-gen
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'src/steps/**/*.ts',
  language: 'pt',
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  // O ambiente é compartilhado com outros candidatos, então poucos workers.
  workers: 4,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    cucumberReporter('html', { outputFile: 'cucumber-report/index.html' }),
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://verzel-store.qa-test-verzel-store.workers.dev',
    locale: 'pt-BR',
    // Evidências: print de todo teste de interface, trace e vídeo dos que falham
    screenshot: 'on',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      grep: /@api/,
    },
    {
      name: 'ui',
      grep: /@ui/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
