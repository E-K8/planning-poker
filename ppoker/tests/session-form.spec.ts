import { test, expect } from '@playwright/test';

test.describe('Session Form', () => {
  test('should join a session successfully', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder="Session ID"]', 'test-session');
    await page.fill('input[placeholder="Your Name"]', 'Code Wizard');

    await page.selectOption('select.form-input', { label: 'Dev' });

    await page.click('button:has-text("Join Session")');

    await expect(page.locator('text=Votes')).toBeVisible();
  });
});
