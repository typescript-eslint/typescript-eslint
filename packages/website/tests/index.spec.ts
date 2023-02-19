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
    expect(errorMessages).toStrictEqual([
      "[error] Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot",
    ]);
  });
});
