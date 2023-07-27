import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Website', () => {
  test.beforeEach(async ({ context }) => {
    // This image link is broken
    await context.route(
      'https://images.opencollective.com/whiteboxinc/ef0d11d/logo.png',
      route =>
        route.fulfill({
          status: 200,
          body: '',
        }),
    );
  });

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
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('typescript-eslint');
    expect(errorMessages).toStrictEqual([]);
  });
});
