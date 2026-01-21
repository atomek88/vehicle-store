import { test, expect } from '@playwright/test';

test.describe('Edit Vehicle Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForLoadState('networkidle');
    // Wait for hydration to complete
    await page.waitForSelector('text=Loading vehicles...', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForSelector('text=Create Vehicle', { timeout: 10000 });

    // Create a test vehicle to edit
    await page.click('text=Create Vehicle');
    await page.selectOption('select[name="type"]', 'sedan');
    await page.fill('input[name="nickname"]', 'Original Sedan');
    await page.fill('input[name="mileage"]', '50000');
    await page.selectOption('select[name="wheels"]', '4');
    await page.selectOption('select[name="doors"]', '4');
    await page.selectOption('select[name="engineStatus"]', 'works');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Vehicle created successfully')).toBeVisible();
  });

  test('should edit vehicle nickname and mileage', async ({ page }) => {
    // Click edit button for the vehicle
    await page.click('text=Original Sedan >> .. >> .. >> text=Edit');

    // Wait for navigation to edit page
    await page.waitForURL(/\/vehicles\/.*\/edit/);

    // Update fields
    await page.fill('input[name="nickname"]', 'Updated Sedan');
    await page.fill('input[name="mileage"]', '60000');

    // Submit
    await page.click('button[type="submit"]');

    // Should show success toast
    await expect(page.locator('text=Vehicle updated successfully')).toBeVisible();

    // Verify changes in the list
    await expect(page.locator('text=Updated Sedan')).toBeVisible();
    await expect(page.locator('text=60,000 mi')).toBeVisible();
  });

  test('should edit vehicle engine status', async ({ page }) => {
    await page.click('text=Original Sedan >> .. >> .. >> text=Edit');
    await page.waitForURL(/\/vehicles\/.*\/edit/);

    // Change engine status
    await page.selectOption('select[name="engineStatus"]', 'fixable');

    await page.click('button[type="submit"]');
    await expect(page.locator('text=Vehicle updated successfully')).toBeVisible();

    // Verify badge changed (look for badge component, not select option)
    await expect(page.locator('.bg-yellow-100:has-text("Fixable")')).toBeVisible();
  });

  test('should preserve registration status when editing', async ({ page }) => {
    // View vehicle details to check registration
    await page.click('text=Original Sedan >> .. >> .. >> text=View');
    await page.waitForURL(/\/vehicles\/.*/);

    // Get registration ID from the registration display section
    const registrationId = await page.locator('.font-mono.text-sm.text-gray-600').textContent();

    // Go to edit
    await page.click('text=Edit Vehicle');

    // Update nickname
    await page.fill('input[name="nickname"]', 'Edited Sedan');
    await page.click('button[type="submit"]');

    // Go back to details
    await page.click('text=Edited Sedan >> .. >> .. >> text=View');

    // Registration should be the same
    await expect(page.locator(`text=${registrationId}`)).toBeVisible();
  });

  test('should not allow changing vehicle type when editing', async ({ page }) => {
    await page.click('text=Original Sedan >> .. >> .. >> text=Edit');
    await page.waitForURL(/\/vehicles\/.*\/edit/);

    // Type selector should be disabled
    const typeSelect = page.locator('select[name="type"]');
    await expect(typeSelect).toBeDisabled();
  });

  test('should reject duplicate nickname when editing', async ({ page }) => {
    // Create another vehicle
    await page.goto('/vehicles');
    await page.click('text=Create Vehicle');
    await page.selectOption('select[name="type"]', 'coupe');
    await page.fill('input[name="nickname"]', 'Another Vehicle');
    await page.fill('input[name="mileage"]', '25000');
    await page.selectOption('select[name="wheels"]', '4');
    await page.selectOption('select[name="doors"]', '2');
    await page.selectOption('select[name="engineStatus"]', 'works');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Vehicle created successfully')).toBeVisible();

    // Try to edit first vehicle with duplicate name
    await page.click('text=Original Sedan >> .. >> .. >> text=Edit');
    await page.fill('input[name="nickname"]', 'Another Vehicle');
    await page.click('button[type="submit"]');

    // Should show error toast
    await expect(page.locator('.text-red-900:has-text("Duplicate")')).toBeVisible();
  });

  test('should cancel editing', async ({ page }) => {
    await page.click('text=Original Sedan >> .. >> .. >> text=Edit');
    await page.waitForURL(/\/vehicles\/.*\/edit/);

    // Make changes
    await page.fill('input[name="nickname"]', 'Should Not Save');

    // Click cancel
    await page.click('text=Cancel');

    // Should navigate back to list
    await page.waitForURL('/vehicles');

    // Original name should still be there
    await expect(page.locator('text=Original Sedan')).toBeVisible();
    await expect(page.locator('text=Should Not Save')).not.toBeVisible();
  });
});
