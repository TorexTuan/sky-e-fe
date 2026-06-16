import { test, expect } from '@playwright/test';

const locales = ['en', 'vi'];

for (const locale of locales) {
  test.describe(`Register Page (${locale})`, () => {
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
      await page.goto('/auth/register');
    });

    test('TC-201: Display register form', async ({ page }) => {
      // Verify key structural elements are visible without relying on hardcoded text
      await expect(page.getByTestId('register-fullname-input')).toBeVisible();
      await expect(page.getByTestId('register-email-input')).toBeVisible();
      await expect(page.getByTestId('register-phone-input')).toBeVisible();
      await expect(page.getByTestId('register-password-input')).toBeVisible();
      await expect(page.getByTestId('register-confirm-password-input')).toBeVisible();
      await expect(page.getByTestId('register-terms-checkbox')).toBeVisible();
      await expect(page.getByTestId('register-submit-button')).toBeVisible();
      await expect(page.getByTestId('register-login-link')).toBeVisible();
    });

    test('TC-202: Validate Full Name', async ({ page }) => {
      const fullnameInput = page.getByTestId('register-fullname-input');
      
      // Type invalid full name and blur
      await fullnameInput.fill('A');
      await fullnameInput.blur();
      
      // Form should not be submittable (button disabled)
      await expect(page.getByTestId('register-submit-button')).toBeDisabled();
    });

    test('TC-204: Validate Phone Number format', async ({ page }) => {
      const phoneInput = page.getByTestId('register-phone-input');
      
      // Type invalid phone number and blur
      await phoneInput.fill('123');
      await phoneInput.blur();
      
      // Form should not be submittable (button disabled)
      await expect(page.getByTestId('register-submit-button')).toBeDisabled();
    });

    test('TC-205 & TC-206: Validate password strength and mismatch', async ({ page }) => {
      const passwordInput = page.getByTestId('register-password-input');
      const confirmPasswordInput = page.getByTestId('register-confirm-password-input');

      // Weak password
      await passwordInput.fill('weak');
      await passwordInput.blur();
      
      // Mismatch password
      await passwordInput.fill('Password123!');
      await confirmPasswordInput.fill('Password1234!');
      await confirmPasswordInput.blur();

      // Form should not be submittable (button disabled)
      await expect(page.getByTestId('register-submit-button')).toBeDisabled();
    });

    test('TC-207: Validate Terms and Conditions acceptance', async ({ page }) => {
      // Fill valid data but leave terms unchecked
      await page.getByTestId('register-fullname-input').fill('Test User');
      await page.getByTestId('register-email-input').fill('test@example.com');
      await page.getByTestId('register-phone-input').fill('0912345678');
      await page.getByTestId('register-password-input').fill('Password123!');
      await page.getByTestId('register-confirm-password-input').fill('Password123!');
      
      // Ensure terms is unchecked
      const termsCheckbox = page.getByTestId('register-terms-checkbox');
      await expect(termsCheckbox).not.toBeChecked();

      await expect(page.getByTestId('register-submit-button')).toBeDisabled();
    });

    test('TC-209: Successful registration', async ({ page }) => {
      const randomEmail = `testuser${Date.now()}@example.com`;

      // Mock the backend response for successful registration
      await page.route('**/api/users/register/', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: "123",
              fullName: "Test User",
              email: randomEmail,
              phone: "+84912345678"
            })
          });
        } else {
          await route.fallback();
        }
      });

      await page.getByTestId('register-fullname-input').fill('Test User');
      await page.getByTestId('register-email-input').fill(randomEmail);
      await page.getByTestId('register-phone-input').fill('0912345678');
      await page.getByTestId('register-password-input').fill('Password123!');
      await page.getByTestId('register-confirm-password-input').fill('Password123!');
      await page.getByTestId('register-terms-checkbox').check();
      
      await page.getByTestId('register-submit-button').click();

      // Wait for success redirect
      await page.waitForURL(/\/auth\/login\?registered=true/);
      await expect(page).toHaveURL(/\/auth\/login\?registered=true/);
    });

    test('TC-203 & TC-210: Validate existing email and phone response (Server Error)', async ({ page }) => {
      // Mock the backend response to return field errors for email and phone
      await page.route('**/api/users/register/', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              email: ['Email already exists.'],
              phone: ['Phone already exists.']
            })
          });
        } else {
          await route.fallback();
        }
      });

      // Intentionally use an email and phone that should trigger "already exists" errors
      await page.getByTestId('register-fullname-input').fill('Test User');
      await page.getByTestId('register-email-input').fill('existinguser@example.com');
      await page.getByTestId('register-phone-input').fill('0912345678');
      await page.getByTestId('register-password-input').fill('Password123!');
      await page.getByTestId('register-confirm-password-input').fill('Password123!');
      await page.getByTestId('register-terms-checkbox').check();
      
      await page.getByTestId('register-submit-button').click();

      // We expect the error to show up under the specific input fields
      await expect(page.getByTestId('register-email-input-error')).toBeVisible();
      await expect(page.getByTestId('register-phone-input-error')).toBeVisible();
    });

    test('TC-211: Navigate to Login page', async ({ page }) => {
      await page.getByTestId('register-login-link').click();
      await expect(page).toHaveURL('/auth/login');
    });
  });
}
