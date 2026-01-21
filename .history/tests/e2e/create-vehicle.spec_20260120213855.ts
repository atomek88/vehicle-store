import { test, expect } from '@playwright/test';

test.describe('Create Vehicle Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForLoadState('networkidle');
    // Wait for hydration to complete
    await page.waitForSelector('text=Loading vehicles...', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForSelector('text=Create Vehicle', { timeout: 10000 });
  });

  test('should create a new sedan successfully', async ({ page }) => {
    // Click create vehicle button
    await page.click('text=Create Vehicle');

    // Wait for modal to appear
    await expect(page.locator('text=Create New Vehicle')).toBeVisible();

    // Fill in the form
    await page.selectOption('select[name="type"]', 'sedan');
    await page.fill('input[name="nickname"]', 'Test Sedan E2E');
    await page.fill('input[name="mileage"]', '15000');
    await page.selectOption('select[name="wheels"]', '4');
    await page.selectOption('select[name="doors"]', '4');
    await page.selectOption('select[name="engineStatus"]', 'works');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for success toast
    await expect(page.locator('text=Vehicle created successfully')).toBeVisible();

    // Verify vehicle appears in the table
    await expect(page.locator('text=Test Sedan E2E')).toBeVisible();
  });

  test('should create a new motorcycle successfully', async ({ page }) => {
    await page.click('text=Create Vehicle');
    await expect(page.locator('text=Create New Vehicle')).toBeVisible();

    await page.selectOption('select[name="type"]', 'motorcycle');
    await page.fill('input[name="nickname"]', 'Test Bike E2E');
    await page.fill('input[name="mileage"]', '5000');
    await page.selectOption('select[name="wheels"]', '2');
    await page.selectOption('select[name="seatStatus"]', 'works');
    await page.selectOption('select[name="engineStatus"]', 'works');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Vehicle created successfully')).toBeVisible();
    await expect(page.locator('text=Test Bike E2E')).toBeVisible();
  });

  test('should create a mini-van with door configuration', async ({ page }) => {
    await page.click('text=Create Vehicle');
    await expect(page.locator('text=Create New Vehicle')).toBeVisible();

    await page.selectOption('select[name="type"]', 'mini-van');
    await page.fill('input[name="nickname"]', 'Test MiniVan E2E');
    await page.fill('input[name="mileage"]', '30000');
    await page.selectOption('select[name="wheels"]', '4');
    await page.selectOption('select[name="doors"]', '4');

    // Configure sliding doors (last 2 doors)
    await page.check('input[name="doorConfig.2.sliding"]');
    await page.check('input[name="doorConfig.3.sliding"]');

    await page.selectOption('select[name="engineStatus"]', 'works');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Vehicle created successfully')).toBeVisible();
    await expect(page.locator('text=Test MiniVan E2E')).toBeVisible();
  });

  test('should reject duplicate nicknames', async ({ page }) => {
    // Create first vehicle
    await page.click('text=Create Vehicle');
    await page.selectOption('select[name="type"]', 'sedan');
    await page.fill('input[name="nickname"]', 'Duplicate Name');
    await page.fill('input[name="mileage"]', '10000');
    await page.selectOption('select[name="wheels"]', '4');
    await page.selectOption('select[name="doors"]', '4');
    await page.selectOption('select[name="engineStatus"]', 'works');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Vehicle created successfully')).toBeVisible();

    // Try to create duplicate
    await page.click('text=Create Vehicle');
    await page.selectOption('select[name="type"]', 'coupe');
    await page.fill('input[name="nickname"]', 'Duplicate Name');
    await page.fill('input[name="mileage"]', '20000');
    await page.selectOption('select[name="wheels"]', '4');
    await page.selectOption('select[name="doors"]', '2');
    await page.selectOption('select[name="engineStatus"]', 'works');
    await page.click('button[type="submit"]');

    // Should show error toast
    await expect(page.locator('text=Duplicate')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('text=Create Vehicle');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=required').first()).toBeVisible();
  });

  test('should cancel vehicle creation', async ({ page }) => {
    await page.click('text=Create Vehicle');
    await expect(page.locator('text=Create New Vehicle')).toBeVisible();

    // Fill some data
    await page.fill('input[name="nickname"]', 'Cancelled Vehicle');

    // Click cancel
    await page.click('text=Cancel');

    // Modal should close
    await expect(page.locator('text=Create New Vehicle')).not.toBeVisible();

    // Vehicle should not be in the list
    await expect(page.locator('text=Cancelled Vehicle')).not.toBeVisible();
  });
});
