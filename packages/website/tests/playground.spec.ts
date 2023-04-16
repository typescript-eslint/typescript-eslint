import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

test.describe('Playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/play');
  });

  test('Accessibility', async ({ page }) => {
    await new AxeBuilder({ page }).analyze();
  });

  // TODO: fix this test and reenable it
  test.skip('Usage', async ({ page }) => {
    // 1. Type some valid code in the playground
    await writeInEditor(page, 'let value: string[];');

    // 2. Enable a lint rule
    await page.getByRole('tab', { name: 'eslintrc' }).click();
    await page.getByRole('button', { name: 'Visual Editor' }).click();
    await page
      .getByLabel(
        '@typescript-eslint/array-type Require consistently using either `T[]` or `Array<T>` for arrays',
      )
      .check();
    await page.getByRole('button', { name: 'Close' }).click();

    // 3. Make sure it still says "All is ok!"
    await expect(page.getByText('All is ok!')).toBeVisible();

    // 4. Change the code to violate the lint rule
    await page.getByRole('tab', { name: 'code' }).click();
    await writeInEditor(page, 'let value: Array<string>;');

    // 5. Make sure it now says the complaint
    await expect(
      page.getByText(
        `Array type using 'Array<string>' is forbidden. Use 'string[]' instead. 1:12 - 1:25`,
      ),
    ).toBeVisible();

    // 6. Press the 'fix' button to autofix that complaint
    await page.getByRole('button', { name: 'fix' }).click();

    // 7. Make sure the code is updated, and it says "All is ok!"
    await expect(page.getByText('let value: string[];')).toBeVisible();
    await expect(page.getByText('All is ok!')).toBeVisible();
  });

  test('AST Viewer', async ({ page }) => {
    // 1. Type some valid code in the playground
    await writeInEditor(page, 'let value: Array<string>;');

    // 2. Enable AST viewer
    await page
      .getByRole('combobox', { name: 'AST Viewer' })
      .selectOption({ label: 'ESTree' });

    // 3. Type some valid code in the playground
    await writeInEditor(page, 'let value: Array<string>;');

    // 4. Validate variable declaration block exists in AST viewer
    await expect(
      page.getByRole('link', { name: 'VariableDeclaration' }),
    ).toBeVisible();
  });
});

async function writeInEditor(page: Page, text: string): Promise<void> {
  const monacoEditor = page.locator('.monaco-editor').nth(0);
  await monacoEditor.click();

  // Select all existing text and delete it first...
  await page.keyboard.down('Control');
  await page.keyboard.down('A');
  await page.keyboard.up('Control');
  await page.keyboard.up('A');
  await page.keyboard.down('Delete');
  await page.keyboard.up('Delete');

  // ...and then type in the text
  await page.keyboard.type(text);
}
