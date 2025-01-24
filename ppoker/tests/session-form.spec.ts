import { test, expect } from '@playwright/test';

test.describe('Session Form', () => {
  test.afterEach(async ({ page }) => {
    // only try to end the session if we're in one
    const endSessionButton = page.getByRole('button', { name: 'End Session' });
    if (await endSessionButton.isVisible()) {
      await endSessionButton.click();
    }
  });

  test('should join a session successfully', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder="Session ID"]', 'test-session-form');
    await page.fill('input[placeholder="Your Name"]', 'Code Wizard');

    await page.selectOption('select.form-input', { label: 'Dev' });

    await page.click('button:has-text("Join Session")');

    await expect(
      page.getByRole('heading', { name: 'Dev votes' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'QA votes' })).toBeVisible();

    await expect(
      page.getByRole('button', { name: '1', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '2', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '3', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '4', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '5', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '6', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '7', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '8', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '9', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '10', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '11', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '12', exact: true })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Reveal Votes' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Reset Votes' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'End Session' })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Results:' })
    ).not.toBeVisible();
    await expect(page.getByText('Dev Average:')).not.toBeVisible();
    await expect(page.getByText('QA Average:')).not.toBeVisible();
  });
});
