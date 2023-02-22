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
      const type = msg.type();
      if (!['error', 'warning'].includes(type)) {
        return;
      }
      const text = msg.text();
      // this log is fine because the ReactDOM usage is controlled by docusaurus, not us
      if (text.includes('ReactDOM.render is no longer supported in React 18')) {
        return;
      }
      errorMessages.push(`[${type}] ${text}`);
    });
    await page.goto('/');
    expect(errorMessages).toStrictEqual([]);
  });
});
