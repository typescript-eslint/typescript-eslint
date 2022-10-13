import AxeBuilder from '@axe-core/playwright';
import { test } from '@playwright/test';

test('Index', async ({ page }) => {
  await page.goto('/');
  await new AxeBuilder({ page }).analyze();
});
