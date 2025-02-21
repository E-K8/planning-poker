import { test, expect, BrowserContext, Page } from '@playwright/test';

// keep track of context and page for cleanup
const contextsToCleanup: BrowserContext[] = [];
const pagesToCleanup: Page[] = [];

test.describe('Voting Flow', () => {
  async function createUserSession(
    context: BrowserContext,
    sessionId: string,
    userName: string,
    role: 'Dev' | 'QA'
  ): Promise<Page> {
    const page = await context.newPage();
    // add page to cleanup list
    pagesToCleanup.push(page);
    contextsToCleanup.push(context);

    await page.goto('/');
    await page.fill('input[placeholder="Session ID"]', sessionId);
    await page.fill('input[placeholder="Your Name"]', userName);
    await page.selectOption('select.form-input', { label: role });
    await page.click('button:has-text("Join Session")');
    return page;
  }

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
    // for single user tests
    if (page) {
      try {
        const endButton = page.getByRole('button', { name: 'End Session' });
        if (await endButton.isVisible()) {
          await endButton.click();
        }
      } catch {
        console.log('Single page cleanup attempted');
      }
    }

    // for multi-user tests
    for (const page of pagesToCleanup) {
      try {
        const endButton = page.getByRole('button', { name: 'End Session' });
        if (await endButton.isVisible()) {
          await endButton.click();
          await page.waitForTimeout(1000);
        }
      } catch {
        console.log('Multi page cleanup attempted');
      }
    }

    // clean up contexts
    for (const context of contextsToCleanup) {
      await context.close();
    }

    // reset arrays for next test
    pagesToCleanup.length = 0;
    contextsToCleanup.length = 0;
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
    const devPage = await createUserSession(
      devContext,
      'test-session-multi-user',
      'Dev User',
      'Dev'
    );
    const qaPage = await createUserSession(
      qaContext,
      'test-session-multi-user',
      'QA User',
      'QA'
    );

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
  });

  test('should calculate correct averages for multiple users voting', async ({
    browser,
  }) => {
    const devContext = await browser.newContext();
    const qaContext = await browser.newContext();

    const devPage = await createUserSession(
      devContext,
      'test-session-averages',
      'Dev User 1',
      'Dev'
    );

    const qaPage = await createUserSession(
      qaContext,
      'test-session-averages',
      'QA User',
      'QA'
    );

    // cast votes: Dev votes 8, QA votes 4
    await devPage.getByRole('button', { name: '8', exact: true }).click();
    await qaPage.getByRole('button', { name: '4', exact: true }).click();

    // reveal votes
    await devPage.getByRole('button', { name: 'Reveal Votes' }).click();

    // verify averages
    await expect(devPage.getByText('Dev Average: 8.00')).toBeVisible();
    await expect(devPage.getByText('QA Average: 4.00')).toBeVisible();

    // verify averages are same on QA's screen
    await expect(qaPage.getByText('Dev Average: 8.00')).toBeVisible();
    await expect(qaPage.getByText('QA Average: 4.00')).toBeVisible();
  });

  test('should handle multiple users voting and resetting votes correctly', async ({
    browser,
  }) => {
    const devContext = await browser.newContext();
    const qaContext = await browser.newContext();

    const devPage = await createUserSession(
      devContext,
      'test-session-reset',
      'Dev User 1',
      'Dev'
    );

    const qaPage = await createUserSession(
      qaContext,
      'test-session-reset',
      'QA User',
      'QA'
    );

    // cast votes: Dev votes 8, QA votes 4
    await devPage.getByRole('button', { name: '8', exact: true }).click();
    await qaPage.getByRole('button', { name: '4', exact: true }).click();

    // reveal votes
    await devPage.getByRole('button', { name: 'Reveal Votes' }).click();

    // verify averages
    await expect(devPage.getByText('Dev Average: 8.00')).toBeVisible();
    await expect(devPage.getByText('QA Average: 4.00')).toBeVisible();

    // reset votes
    await devPage.getByRole('button', { name: 'Reset Votes' }).click();

    // verify votes are cleared
    await expect(devPage.getByText('Dev User 1 (Dev) : ?')).toBeVisible();
    await expect(qaPage.getByText('QA User (QA) : ?')).toBeVisible();
  });

  test('should disconnect all users when session is ended', async ({
    browser,
  }) => {
    const devContext = await browser.newContext();
    const qaContext = await browser.newContext();

    const devPage = await createUserSession(
      devContext,
      'test-session-end',
      'Dev User',
      'Dev'
    );

    const qaPage = await createUserSession(
      qaContext,
      'test-session-end',
      'QA User',
      'QA'
    );

    // verify both users are in the session initially
    await expect(devPage.getByText('QA User (QA) : ?')).toBeVisible();
    await expect(qaPage.getByText('Dev User (Dev) : ?')).toBeVisible();

    // end session from dev's page
    await devPage.getByRole('button', { name: 'End Session' }).click();

    // verify both users are returned to the join session screen
    await expect(devPage.getByPlaceholder('Session ID')).toBeVisible();
    await expect(devPage.getByPlaceholder('Your Name')).toBeVisible();
    await expect(
      devPage.getByRole('button', { name: 'Join Session' })
    ).toBeVisible();

    await expect(qaPage.getByPlaceholder('Session ID')).toBeVisible();
    await expect(qaPage.getByPlaceholder('Your Name')).toBeVisible();
    await expect(
      qaPage.getByRole('button', { name: 'Join Session' })
    ).toBeVisible();
  });
});
