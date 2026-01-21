import { test, expect } from '@playwright/test';

test.describe('Filters and Sorting', () => {
  test.beforeEach(async ({ page }) => {
    // Pre-seed vehicles via localStorage for fast setup
    await page.goto('/vehicles');
    
    // Create test vehicles data directly (must match VehiclePersistedSchema)
    const testVehicles = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        type: 'sedan',
        nickname: 'Family Sedan',
        mileage: 50000,
        wheels: 4,
        doors: 4,
        engineStatus: 'works',
        registration: { status: 'registered', registrationId: 'REG-TEST-SEDAN-1' },
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        type: 'coupe',
        nickname: 'Sports Coupe',
        mileage: 25000,
        wheels: 4,
        doors: 2,
        engineStatus: 'fixable',
        registration: { status: 'registered', registrationId: 'REG-TEST-COUPE-1' },
        createdAt: new Date('2024-01-02').toISOString(),
        updatedAt: new Date('2024-01-02').toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        type: 'mini-van',
        nickname: 'Cargo Van',
        mileage: 150000,
        wheels: 4,
        doors: 4,
        doorConfig: [
          { sliding: true },
          { sliding: true },
          { sliding: false },
          { sliding: false },
        ],
        engineStatus: 'junk',
        registration: { status: 'failed', registrationError: 'Mileage exceeds limit' },
        createdAt: new Date('2024-01-03').toISOString(),
        updatedAt: new Date('2024-01-03').toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        type: 'motorcycle',
        nickname: 'Speed Bike',
        mileage: 15000,
        wheels: 2,
        seatStatus: 'works',
        engineStatus: 'works',
        registration: { status: 'registered', registrationId: 'REG-TEST-MOTO-1' },
        createdAt: new Date('2024-01-04').toISOString(),
        updatedAt: new Date('2024-01-04').toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        type: 'sedan',
        nickname: 'Old Sedan',
        mileage: 200000,
        wheels: 4,
        doors: 4,
        engineStatus: 'junk',
        registration: { status: 'failed', registrationError: 'Mileage exceeds limit' },
        createdAt: new Date('2024-01-05').toISOString(),
        updatedAt: new Date('2024-01-05').toISOString(),
      },
    ];

    // Seed localStorage with test data
    await page.evaluate((vehicles) => {
      const storageData = {
        version: 1,
        vehicles: vehicles,
      };
      localStorage.setItem('junkyard-tracker-v1', JSON.stringify(storageData));
    }, testVehicles);

    // Reload to hydrate from localStorage
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for hydration to complete
    await page.waitForSelector('text=Loading vehicles...', { state: 'hidden', timeout: 10000 }).catch(() => {});
    
    // Wait for table to exist and be populated with all 5 vehicles
    await page.waitForSelector('table tbody', { timeout: 10000 });
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr');
      return rows.length === 5;
    }, { timeout: 15000 });
  });

  test('should filter by search query (nickname)', async ({ page }) => {
    // Search for "Sedan"
    await page.fill('input[placeholder*="Search"]', 'Sedan');
    
    // Should show vehicles with "Sedan" in nickname
    await expect(page.locator('text=Family Sedan')).toBeVisible();
    await expect(page.locator('text=Old Sedan')).toBeVisible();
    
    // Should not show other vehicles
    await expect(page.locator('text=Sports Coupe')).not.toBeVisible();
    await expect(page.locator('text=Cargo Van')).not.toBeVisible();
    await expect(page.locator('text=Speed Bike')).not.toBeVisible();
  });

  test('should filter by vehicle type', async ({ page }) => {
    // Filter by sedan - checkbox is in a label with text "sedan"
    await page.locator('label:has-text("sedan") input[type="checkbox"]').check();
    
    // Should show only sedans
    await expect(page.locator('text=Family Sedan')).toBeVisible();
    await expect(page.locator('text=Old Sedan')).toBeVisible();
    
    // Should not show other types
    await expect(page.locator('text=Sports Coupe')).not.toBeVisible();
    await expect(page.locator('text=Cargo Van')).not.toBeVisible();
    await expect(page.locator('text=Speed Bike')).not.toBeVisible();
  });

  test('should filter by multiple vehicle types', async ({ page }) => {
    // Filter by sedan and coupe
    await page.locator('label:has-text("sedan") input[type="checkbox"]').check();
    await page.locator('label:has-text("coupe") input[type="checkbox"]').check();
    
    // Should show sedans and coupes
    await expect(page.locator('text=Family Sedan')).toBeVisible();
    await expect(page.locator('text=Old Sedan')).toBeVisible();
    await expect(page.locator('text=Sports Coupe')).toBeVisible();
    
    // Should not show other types
    await expect(page.locator('text=Cargo Van')).not.toBeVisible();
    await expect(page.locator('text=Speed Bike')).not.toBeVisible();
  });

  test('should filter by engine status', async ({ page }) => {
    // Filter by "works" - checkbox is in Engine Status section
    await page.locator('label:has-text("Engine Status") ~ div label:has-text("works") input[type="checkbox"]').first().check();
    
    // Should show vehicles with working engines
    await expect(page.locator('text=Family Sedan')).toBeVisible();
    await expect(page.locator('text=Speed Bike')).toBeVisible();
    
    // Should not show other statuses
    await expect(page.locator('text=Sports Coupe')).not.toBeVisible();
    await expect(page.locator('text=Cargo Van')).not.toBeVisible();
    await expect(page.locator('text=Old Sedan')).not.toBeVisible();
  });

  test('should filter by registration status', async ({ page }) => {
    // Filter by registered (vehicles with mileage under limits)
    await page.locator('label:has-text("Registered") input[type="checkbox"]').check();
    
    // Should show registered vehicles (Family Sedan: 50k, Sports Coupe: 25k, Speed Bike: 15k)
    await expect(page.locator('text=Family Sedan')).toBeVisible();
    await expect(page.locator('text=Sports Coupe')).toBeVisible();
    await expect(page.locator('text=Speed Bike')).toBeVisible();
    
    // Should not show failed registrations (Cargo Van: 150k, Old Sedan: 200k)
    await expect(page.locator('text=Cargo Van')).not.toBeVisible();
    await expect(page.locator('text=Old Sedan')).not.toBeVisible();
  });

  test('should combine multiple filters', async ({ page }) => {
    // Filter by sedan type AND works engine status
    await page.locator('label:has-text("sedan") input[type="checkbox"]').check();
    await page.locator('label:has-text("Engine Status") ~ div label:has-text("works") input[type="checkbox"]').first().check();
    
    // Should show only Family Sedan (sedan with works engine)
    await expect(page.locator('text=Family Sedan')).toBeVisible();
    
    // Should not show Old Sedan (sedan but junk engine)
    await expect(page.locator('text=Old Sedan')).not.toBeVisible();
    
    // Should not show other vehicles
    await expect(page.locator('text=Sports Coupe')).not.toBeVisible();
    await expect(page.locator('text=Cargo Van')).not.toBeVisible();
    await expect(page.locator('text=Speed Bike')).not.toBeVisible();
  });

  test('should reset all filters', async ({ page }) => {
    // Apply some filters
    await page.locator('label:has-text("sedan") input[type="checkbox"]').check();
    await page.fill('input[placeholder*="Search"]', 'Family');
    
    // Verify filters are applied
    await expect(page.locator('text=Family Sedan')).toBeVisible();
    await expect(page.locator('text=Sports Coupe')).not.toBeVisible();
    
    // Click reset filters
    await page.click('text=Reset Filters');
    
    // All vehicles should be visible again
    await expect(page.locator('text=Family Sedan')).toBeVisible();
    await expect(page.locator('text=Sports Coupe')).toBeVisible();
    await expect(page.locator('text=Cargo Van')).toBeVisible();
    await expect(page.locator('text=Speed Bike')).toBeVisible();
    await expect(page.locator('text=Old Sedan')).toBeVisible();
  });

  test('should sort by nickname ascending', async ({ page }) => {
    // Select sort by nickname ascending - select is next to "Sort by:" text
    await page.locator('text=Sort by: >> .. >> select').selectOption('nickname-asc');
    
    // Get all vehicle nicknames in order
    const rows = await page.locator('tbody tr').all();
    const nicknames = await Promise.all(
      rows.map(async row => (await row.locator('td:nth-child(2)').textContent()) || '')
    );
    
    // Should be in alphabetical order
    expect(nicknames).toEqual([
      'Cargo Van',
      'Family Sedan',
      'Old Sedan',
      'Speed Bike',
      'Sports Coupe',
    ]);
  });

  test('should sort by nickname descending', async ({ page }) => {
    // Select sort by nickname descending
    await page.locator('text=Sort by: >> .. >> select').selectOption('nickname-desc');
    
    // Get all vehicle nicknames in order
    const rows = await page.locator('tbody tr').all();
    const nicknames = await Promise.all(
      rows.map(async row => (await row.locator('td:nth-child(2)').textContent()) || '')
    );
    
    // Should be in reverse alphabetical order
    expect(nicknames).toEqual([
      'Sports Coupe',
      'Speed Bike',
      'Old Sedan',
      'Family Sedan',
      'Cargo Van',
    ]);
  });

  test('should sort by mileage ascending', async ({ page }) => {
    // Select sort by mileage ascending
    await page.locator('text=Sort by: >> .. >> select').selectOption('mileage-asc');
    
    // Get all vehicle nicknames in order (proxy for mileage order)
    const rows = await page.locator('tbody tr').all();
    const nicknames = await Promise.all(
      rows.map(row => row.locator('td:nth-child(2)').textContent())
    );
    
    // Should be ordered by mileage: 15k, 25k, 50k, 150k, 200k
    expect(nicknames).toEqual([
      'Speed Bike',
      'Sports Coupe',
      'Family Sedan',
      'Cargo Van',
      'Old Sedan',
    ]);
  });

  test('should sort by mileage descending', async ({ page }) => {
    // Select sort by mileage descending
    await page.locator('text=Sort by: >> .. >> select').selectOption('mileage-desc');
    
    // Get all vehicle nicknames in order
    const rows = await page.locator('tbody tr').all();
    const nicknames = await Promise.all(
      rows.map(async row => (await row.locator('td:nth-child(2)').textContent()) || '')
    );
    
    // Should be ordered by mileage descending: 200k, 150k, 50k, 25k, 15k
    expect(nicknames).toEqual([
      'Old Sedan',
      'Cargo Van',
      'Family Sedan',
      'Sports Coupe',
      'Speed Bike',
    ]);
  });

  test('should sort by creation date (newest first)', async ({ page }) => {
    // Select sort by newest first
    await page.locator('text=Sort by: >> .. >> select').selectOption('createdAt-desc');
    
    // Get all vehicle nicknames in order
    const rows = await page.locator('tbody tr').all();
    const nicknames = await Promise.all(
      rows.map(async row => (await row.locator('td:nth-child(2)').textContent()) || '')
    );
    
    // Should be in reverse creation order (last created first)
    expect(nicknames).toEqual([
      'Old Sedan',
      'Speed Bike',
      'Cargo Van',
      'Sports Coupe',
      'Family Sedan',
    ]);
  });

  test('should combine filters and sorting', async ({ page }) => {
    // Filter by sedan type
    await page.locator('label:has-text("sedan") input[type="checkbox"]').check();
    
    // Sort by mileage descending
    await page.locator('text=Sort by: >> .. >> select').selectOption('mileage-desc');
    
    // Should show only sedans, sorted by mileage descending
    const rows = await page.locator('tbody tr').all();
    const nicknames = await Promise.all(
      rows.map(row => row.locator('td:nth-child(2)').textContent())
    );
    
    expect(nicknames).toEqual([
      'Old Sedan',
      'Family Sedan',
    ]);
  });

  test('should update vehicle count when filtering', async ({ page }) => {
    // Check initial count (5 vehicles)
    await expect(page.locator('text=/Manage your vehicle inventory \\(5 of 5 vehicles\\)/')).toBeVisible();
    
    // Apply filter
    await page.locator('label:has-text("sedan") input[type="checkbox"]').check();
    
    // Count should update to show filtered count
    await expect(page.locator('text=/Manage your vehicle inventory \\(2 of 5 vehicles\\)/')).toBeVisible();
  });
});
