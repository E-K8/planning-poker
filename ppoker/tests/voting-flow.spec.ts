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

  test('should show error message when revealing votes before casting any', async ({
    page,
  }) => {
    // try to reveal votes immediately (without casting any votes)
    await page.getByRole('button', { name: 'Reveal Votes' }).click();

    // verify error message appears
    await expect(
      page.getByText('At least one user must vote to enable reveal')
    ).toBeVisible();

    // verify that Results are still not visible
    await expect(
      page.getByRole('heading', { name: 'Results:' })
    ).not.toBeVisible();
    await expect(page.getByText('Dev Average:')).not.toBeVisible();
    await expect(page.getByText('QA Average:')).not.toBeVisible();
  });

  test('should handle multiple users voting correctly', async ({ browser }) => {
    // create two contexts for two different users
    const devContext = await browser.newContext();
    const qaContext = await browser.newContext();

    // create pages for both users
    const devPage = await devContext.newPage();
    const qaPage = await qaContext.newPage();

    // first user (Dev) joins
    await devPage.goto('/');
    await devPage.fill(
      'input[placeholder="Session ID"]',
      'test-session-multi-user'
    );
    await devPage.fill('input[placeholder="Your Name"]', 'Dev User');
    await devPage.selectOption('select.form-input', { label: 'Dev' });
    await devPage.click('button:has-text("Join Session")');

    // second user (QA) joins the same session
    await qaPage.goto('/');
    await qaPage.fill(
      'input[placeholder="Session ID"]',
      'test-session-multi-user'
    );
    await qaPage.fill('input[placeholder="Your Name"]', 'QA User');
    await qaPage.selectOption('select.form-input', { label: 'QA' });
    await qaPage.click('button:has-text("Join Session")');

    // wait for both users to be visible in the session
    await expect(devPage.getByText('QA User (QA)')).toBeVisible();
    await expect(qaPage.getByText('Dev User (Dev)')).toBeVisible();

    // both users cast votes
    await devPage.getByRole('button', { name: '5', exact: true }).click();
    await qaPage.getByRole('button', { name: '3', exact: true }).click();

    // verify vote indicators appear for both users
    await expect(devPage.getByText('Dev User (Dev) : ✔️')).toBeVisible();
    await expect(devPage.getByText('QA User (QA) : ✔️')).toBeVisible();

    // reveal votes
    await devPage.getByRole('button', { name: 'Reveal Votes' }).click();

    // verify votes are revealed on both screens
    await expect(devPage.getByText('Dev User (Dev) : 5')).toBeVisible();
    await expect(devPage.getByText('QA User (QA) : 3')).toBeVisible();
    await expect(qaPage.getByText('Dev User (Dev) : 5')).toBeVisible();
    await expect(qaPage.getByText('QA User (QA) : 3')).toBeVisible();

    // сlean up by closing contexts
    await devContext.close();
    await qaContext.close();
  });
});
