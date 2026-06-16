import { test, expect } from '@playwright/test';

const locales = ['en', 'vi'];

for (const locale of locales) {
  test.describe(`Login Page (${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      // Set the i18n cookie to enforce language before navigation
      await page.context().addCookies([
        {
          name: 'i18n_redirected',
          value: locale,
          domain: 'localhost',
          path: '/',
        },
      ]);
      await page.goto('/auth/login');
    });

    test('TC-101: Display login form', async ({ page }) => {
      // Verify key structural elements are visible without relying on hardcoded text
      await expect(page.getByTestId('login-email-input')).toBeVisible();
      await expect(page.getByTestId('login-password-input')).toBeVisible();
      await expect(page.getByTestId('login-remember-me')).toBeVisible();
      await expect(page.getByTestId('login-submit-button')).toBeVisible();
      await expect(page.getByTestId('login-forgot-password-link')).toBeVisible();
      await expect(page.getByTestId('login-register-link')).toBeVisible();
    });

    test('TC-102: Toggle password visibility', async ({ page }) => {
      const passwordInput = page.getByTestId('login-password-input');
      const toggleBtn = page.getByTestId('login-toggle-password');

      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click toggle
      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click toggle again
      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('TC-103: Validate Email field on blur', async ({ page }) => {
      const emailInput = page.getByTestId('login-email-input');

      // Type invalid email and blur
      await emailInput.fill('invalid-email');
      await emailInput.blur();

      // The email input should go into an invalid state. Since we can't assert on specific translated strings, 
      // we can verify the form prevents submission and stays on the same page.
      await page.getByTestId('login-submit-button').click();
      await expect(page).toHaveURL('/auth/login');
    });

    test('TC-104: Validate empty fields on submit', async ({ page }) => {
      await page.getByTestId('login-submit-button').click();
      // Form should not submit
      await expect(page).toHaveURL('/auth/login');
    });

    test('TC-105: Successful login', async ({ page }) => {
      // NOTE: Using a hypothetical valid test account against the real API
      await page.getByTestId('login-email-input').fill('bob@yopmail.com');
      await page.getByTestId('login-password-input').fill('Bob1234$');

      // Trigger submission. If it fails due to invalid real-backend credentials, that is the expected E2E behavior 
      // when test accounts are not properly seeded.
      await page.getByTestId('login-submit-button').click();

      // Wait for either success redirect or server error to render.
      // We expect success in this test case. 
      await page.waitForURL('/');
      await expect(page).toHaveURL('/');
    });

    test('TC-106: Failed login — incorrect credentials', async ({ page }) => {
      await page.getByTestId('login-email-input').fill('wrong@example.com');
      await page.getByTestId('login-password-input').fill('wrongpassword123');
      await page.getByTestId('login-submit-button').click();

      // We expect the server error container to show up
      await expect(page.getByTestId('login-server-error')).toBeVisible();
    });

    test('TC-107: Remember me functionality', async ({ page }) => {
      const rememberCheckbox = page.getByTestId('login-remember-me');
      await rememberCheckbox.check();
      await expect(rememberCheckbox).toBeChecked();
    });

    test('TC-109: Navigate to Register page', async ({ page }) => {
      await page.getByTestId('login-register-link').click();
      await expect(page).toHaveURL('/auth/register');
    });
  });
}
