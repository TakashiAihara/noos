import { expect, test } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the application title', async ({ page }) => {
    await page.goto('/')

    // Check if the page title is correct
    await expect(page).toHaveTitle(/Yomi/)

    // Check if the main heading is displayed
    await expect(page.getByRole('heading', { name: 'Yomi RSS Reader' })).toBeVisible()
  })

  test('should display welcome message', async ({ page }) => {
    await page.goto('/')

    // Check if welcome message is displayed
    await expect(page.getByText('Welcome to Yomi RSS Reader')).toBeVisible()
  })

  test('should have proper layout structure', async ({ page }) => {
    await page.goto('/')

    // Check if header exists
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Check if main content exists
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should be responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Yomi RSS Reader' })).toBeVisible()

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading', { name: 'Yomi RSS Reader' })).toBeVisible()
  })
})
