import { test, expect } from '@playwright/test';

test.describe('Delete Vehicle Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/vehicles');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    // Wait for hydration to complete
    await page.waitForSelector('text=Loading vehicles...', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForSelector('text=Create Vehicle', { timeout: 10000 });
  });

  test('should delete vehicle from list view', async ({ page }) => {
    // Create a test vehicle
    await page.click('text=Create Vehicle');
    await page.selectOption('select[name="type"]', 'sedan');
    await page.fill('input[name="nickname"]', 'To Be Deleted');
    await page.fill('input[name="mileage"]', '10000');
    await page.selectOption('select[name="wheels"]', '4');
    await page.selectOption('select[name="doors"]', '4');
    await page.selectOption('select[name="engineStatus"]', 'works');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Vehicle created successfully')).toBeVisible();
    // Wait for modal to close
    await page.waitForSelector('text=Create New Vehicle', { state: 'hidden', timeout: 5000 });

    // Click delete button - find the row with the vehicle and click its Delete button
    const row = page.locator('tr:has-text("To Be Deleted")');
    await row.getByRole('button', { name: 'Delete' }).click();

    // Wait for dialog to open and confirm deletion
    await expect(page.getByRole('heading', { name: 'Delete Vehicle' })).toBeVisible();
    await expect(page.locator('text=Are you sure')).toBeVisible();
    // Click the dialog's Delete button (not the table button)
    await page.locator('dialog, [role="dialog"]').getByRole('button', { name: 'Delete', exact: true }).click();

    // Should show success toast
    await expect(page.locator('text=Vehicle deleted successfully')).toBeVisible();

    // Vehicle should be removed from list
    await expect(page.locator('text=To Be Deleted')).not.toBeVisible();
  });

  test('should delete vehicle from details view', async ({ page }) => {
    // Create a test vehicle
    await page.click('text=Create Vehicle');
    await page.selectOption('select[name="type"]', 'motorcycle');
    await page.fill('input[name="nickname"]', 'Bike To Delete');
    await page.fill('input[name="mileage"]', '5000');
    await page.selectOption('select[name="wheels"]', '2');
    await page.selectOption('select[name="seatStatus"]', 'works');
    await page.selectOption('select[name="engineStatus"]', 'works');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Vehicle created successfully')).toBeVisible();

    // Navigate to details view
    await page.click('text=Bike To Delete >> .. >> .. >> text=View');
    await page.waitForURL(/\/vehicles\/.*/);

    // Click delete button
    await page.click('text=Delete Vehicle');

    // Confirm deletion
    await expect(page.getByRole('heading', { name: 'Delete Vehicle' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    // Should redirect to list and show success
    await page.waitForURL('/vehicles');
    await expect(page.locator('text=Vehicle deleted successfully')).toBeVisible();

    // Vehicle should not be in list
    await expect(page.locator('text=Bike To Delete')).not.toBeVisible();
  });

  test('should cancel deletion from confirmation dialog', async ({ page }) => {
    // Create a test vehicle
    await page.click('text=Create Vehicle');
    await page.selectOption('select[name="type"]', 'coupe');
    await page.fill('input[name="nickname"]', 'Keep This One');
    await page.fill('input[name="mileage"]', '15000');
    await page.selectOption('select[name="wheels"]', '4');
    await page.selectOption('select[name="doors"]', '2');
    await page.selectOption('select[name="engineStatus"]', 'works');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Vehicle created successfully')).toBeVisible();

    // Click delete
    await page.click('text=Keep This One >> .. >> .. >> text=Delete');

    // Dialog should appear
    await expect(page.locator('text=Delete Vehicle')).toBeVisible();

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Dialog should close
    await expect(page.locator('text=Delete Vehicle')).not.toBeVisible();

    // Vehicle should still be in list
    await expect(page.locator('text=Keep This One')).toBeVisible();
  });

  test('should delete multiple vehicles sequentially', async ({ page }) => {
    // Create multiple vehicles
    const vehicles = ['Vehicle One', 'Vehicle Two', 'Vehicle Three'];

    for (const name of vehicles) {
      await page.click('text=Create Vehicle');
      await page.selectOption('select[name="type"]', 'sedan');
      await page.fill('input[name="nickname"]', name);
      await page.fill('input[name="mileage"]', '10000');
      await page.selectOption('select[name="wheels"]', '4');
      await page.selectOption('select[name="doors"]', '4');
      await page.selectOption('select[name="engineStatus"]', 'works');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Vehicle created successfully')).toBeVisible();
      // Wait for toast to auto-dismiss before creating next vehicle
      await page.waitForTimeout(5500);
    }

    // Delete first vehicle
    await page.click('text=Vehicle One >> .. >> .. >> text=Delete');
    await expect(page.getByRole('heading', { name: 'Delete Vehicle' })).toBeVisible();
    await page.locator('dialog, [role="dialog"]').getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.locator('text=Vehicle deleted successfully')).toBeVisible();
    await expect(page.locator('text=Vehicle One')).not.toBeVisible();

    // Delete second vehicle
    await page.click('text=Vehicle Two >> .. >> .. >> text=Delete');
    await expect(page.getByRole('heading', { name: 'Delete Vehicle' })).toBeVisible();
    await page.locator('dialog, [role="dialog"]').getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.locator('text=Vehicle deleted successfully')).toBeVisible();
    await expect(page.locator('text=Vehicle Two')).not.toBeVisible();

    // Third vehicle should still exist
    await expect(page.locator('text=Vehicle Three')).toBeVisible();
  });

  test('should show empty state after deleting all vehicles', async ({ page }) => {
    // Create one vehicle
    await page.click('text=Create Vehicle');
    await page.selectOption('select[name="type"]', 'sedan');
    await page.fill('input[name="nickname"]', 'Last Vehicle');
    await page.fill('input[name="mileage"]', '10000');
    await page.selectOption('select[name="wheels"]', '4');
    await page.selectOption('select[name="doors"]', '4');
    await page.selectOption('select[name="engineStatus"]', 'works');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Vehicle created successfully')).toBeVisible();

    // Delete it
    await page.click('text=Last Vehicle >> .. >> .. >> text=Delete');
    await expect(page.getByRole('heading', { name: 'Delete Vehicle' })).toBeVisible();
    await page.locator('dialog, [role="dialog"]').getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.locator('text=Vehicle deleted successfully')).toBeVisible();

    // Should show empty state
    await expect(page.locator('text=No vehicles found')).toBeVisible();
  });
});
