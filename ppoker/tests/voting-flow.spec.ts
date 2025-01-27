import { test, expect } from '@playwright/test';

test.describe('Voting Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // make session ID unique to avoid conflicts with other tests
    const testInfo = test.info();
    const sessionId = `test-session-voting-${testInfo.title.replace(
      /\s/g,
      '-'
    )}`;

    await page.fill('input[placeholder="Session ID"]', sessionId);
    await page.fill('input[placeholder="Your Name"]', 'Code Wizard');
    await page.selectOption('select.form-input', { label: 'Dev' });
    await page.click('button:has-text("Join Session")');

    // add small delay to ensure the page has loaded
    await page.waitForTimeout(1000);

    // verify we're in the session before starting the test
    await expect(
      page.getByRole('heading', { name: 'Dev votes' })
    ).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    await page.getByRole('button', { name: 'End Session' }).click();
  });

  test('should cast vote and reveal results with averages', async ({
    page,
  }) => {
    // verify average is not visible initially
    await expect(
      page.getByRole('heading', { name: 'Results:' })
    ).not.toBeVisible();

    // cast a vote
    await page.getByRole('button', { name: '4', exact: true }).click();

    await page.waitForTimeout(500);

    // reveal votes
    await page.getByRole('button', { name: 'Reveal Votes' }).click();

    await page.waitForTimeout(500);

    // verify average display becomes visible
    await expect(page.getByRole('heading', { name: 'Results:' })).toBeVisible();
    await expect(page.getByText('Dev Average:')).toBeVisible();
    await expect(page.getByText('QA Average:')).toBeVisible();
  });

  test('should reset votes and hide results when Reset Votes is clicked', async ({
    page,
  }) => {
    // cast a vote
    await page.getByRole('button', { name: '4', exact: true }).click();
    await page.waitForTimeout(500);

    // reveal votes
    await page.getByRole('button', { name: 'Reveal Votes' }).click();
    await page.waitForTimeout(500);

    // verify average display becomes visible
    await expect(page.getByRole('heading', { name: 'Results:' })).toBeVisible();

    // reset votes
    await page.getByRole('button', { name: 'Reset Votes' }).click();
    await page.waitForTimeout(1000);

    // votes are cleared
    await expect(
      page.getByRole('heading', { name: 'Results:' })
    ).not.toBeVisible();
    await expect(page.getByText('Dev Average:')).not.toBeVisible();
    await expect(page.getByText('QA Average:')).not.toBeVisible();

    // verify question mark appears next to the user name
    await expect(page.getByText('Code Wizard (Dev) : ?')).toBeVisible();
  });
});
