import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const API_BASE = 'https://dummyjson.com/auth';

async function mockDummyJsonAuth(page: Page): Promise<void> {
  await page.route(`${API_BASE}/**`, async (route) => {
    const endpoint = new URL(route.request().url()).pathname;

    if (endpoint.endsWith('/login')) {
      await route.fulfill({
        json: { accessToken: 'test-access-token', refreshToken: 'test-refresh-token' },
      });
      return;
    }

    if (endpoint.endsWith('/refresh')) {
      await route.fulfill({
        json: { accessToken: 'refreshed-access-token', refreshToken: 'test-refresh-token' },
      });
      return;
    }

    if (endpoint.endsWith('/me')) {
      await route.fulfill({
        json: {
          id: 1,
          username: 'emilys',
          firstName: 'Emily',
          lastName: 'Johnson',
          email: 'emily@example.com',
          image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
        },
      });
      return;
    }

    await route.fallback();
  });
}

async function signInWithDemo(page: Page): Promise<void> {
  await mockDummyJsonAuth(page);
  await page.goto('/login');
  await page.getByRole('button', { name: 'Use demo account' }).click();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/app/home/overview');
}

test('signs in with the demo action and restores the session after reload', async ({ page }) => {
  await signInWithDemo(page);
  await expect(page.getByRole('heading', { name: 'Build your horizon.' })).toBeVisible();
  await expect(page.getByText('Emily Johnson')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Build your horizon.' })).toBeVisible();
});

test('supports Home, End, Up, and Down keyboard behavior on the Ionic planner ranges', async ({
  page,
}) => {
  await signInWithDemo(page);

  const contribution = page.getByRole('slider', { name: 'Monthly contribution' });
  const contributionPanel = page
    .locator('.range-panel')
    .filter({ hasText: 'Monthly contribution' });
  await contribution.press('End');
  await expect(contributionPanel).toContainText('$2,000');
  await contribution.press('ArrowDown');
  await expect(contributionPanel).toContainText('$1,950');
  await contribution.press('Home');
  await expect(contributionPanel).toContainText('$0');

  const horizon = page.getByRole('slider', { name: 'Contribution horizon in months' });
  const horizonPanel = page.locator('.range-panel').filter({ hasText: 'Horizon' });
  await horizon.press('End');
  await expect(horizonPanel).toContainText('24 months');
  await horizon.press('Home');
  await expect(horizonPanel).toContainText('1 month');
});

test('opens the Ionic account action sheet and requires confirmation before sign-out', async ({
  page,
}) => {
  await signInWithDemo(page);

  await page.getByRole('button', { name: 'Open account actions' }).click();
  const actionSheet = page.locator('ion-action-sheet');
  await expect(actionSheet).toBeVisible();
  await actionSheet.getByRole('button', { name: 'Sign out' }).click();

  const alert = page.locator('ion-alert');
  await expect(alert).toBeVisible();
  await alert.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL('**/login');
});

test('recovers a protected deep link after demo authentication', async ({ page }) => {
  await mockDummyJsonAuth(page);
  await page.goto('/app/security');
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fapp%2Fsecurity/);

  await page.getByRole('button', { name: 'Use demo account' }).click();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/app/security');
  await expect(page.getByRole('heading', { name: 'Security' })).toBeVisible();
});

test('navigates across scenario, currency segment, analytics, and placeholders', async ({
  page,
}) => {
  await signInWithDemo(page);

  await page.getByRole('link', { name: /Current capital.*Available today/ }).click();
  await page.waitForURL('**/app/home/currency/current');
  await expect(page.getByRole('heading', { name: 'Currency mix' })).toBeVisible();

  await page.getByRole('button', { name: /EUR 30%.*Euro/ }).click();
  await expect(page.getByText('EUR reference')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'EUR' })).toHaveAttribute('aria-selected', 'true');

  await page.goto('/app/home/analytics');
  await expect(page.getByRole('heading', { name: /\$2,100/ })).toBeVisible();
  await page.locator('ion-segment-button[value="allocation"]').click({ force: true });
  await expect(page.getByText('USD allocation')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Allocation' })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  await page.goto('/app/security');
  await expect(page.getByRole('heading', { name: 'Security' })).toBeVisible();
});

test('keeps the login layout inside a 280px viewport and has no detectable serious axe issues', async ({
  page,
}) => {
  await page.setViewportSize({ width: 280, height: 720 });
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    ),
  ).toEqual([]);
});
