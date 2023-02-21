import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Website', () => {
  test('Axe', async ({ page }) => {
    await page.goto('/');
    await new AxeBuilder({ page }).analyze();
  });

  test('should have no errors', async ({ page }) => {
    const errorMessages: string[] = [];
    page.on('console', msg => {
      if (['error', 'warning'].includes(msg.type())) {
        errorMessages.push(`[${msg.type()}] ${msg.text()}`);
      }
    });
    await page.goto('/');
    expect(errorMessages).toStrictEqual([]);
  });
});
