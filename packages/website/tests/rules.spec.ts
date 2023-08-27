import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Rules Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rules');
  });

  test('Accessibility', async ({ page }) => {
    await new AxeBuilder({ page }).analyze();
  });

  test('Rules filters are saved to the URL', async ({ page }) => {
    await page.getByText('🔧 fixable').first().click();
    await page.getByText('✅ recommended').first().click();
    await page.getByText('✅ recommended').first().click();

    expect(new URL(page.url()).search).toBe(
      '?supported-rules=xrecommended-fixable',
    );
  });

  test('Rules filters are read from the URL on page load', async ({ page }) => {
    await page.goto('/rules?supported-rules=strict-xfixable');

    const strict = page.getByText('🔒 strict').first();
    const fixable = page.getByText('🔧 fixable').first();

    await expect(strict).toHaveAttribute('aria-label', /Current: include/);
    await expect(fixable).toHaveAttribute('aria-label', /Current: exclude/);
  });
});
