/**
 * Form Validation Utilities
 */

import { VALIDATION_RULES, AUTH_MESSAGES } from '~/constants/auth';

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationError | null {
  if (!email || email.trim() === '') {
    return {
      field: 'email',
      message: AUTH_MESSAGES.EMAIL_REQUIRED,
    };
  }

  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return {
      field: 'email',
      message: AUTH_MESSAGES.EMAIL_INVALID,
    };
  }

  return null;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationError | null {
  if (!password || password.trim() === '') {
    return {
      field: 'password',
      message: AUTH_MESSAGES.PASSWORD_REQUIRED,
    };
  }

  if (!VALIDATION_RULES.PASSWORD_REGEX.test(password)) {
    return {
      field: 'password',
      message: AUTH_MESSAGES.PASSWORD_INVALID_FORMAT,
    };
  }

  return null;
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): ValidationError | null {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return {
      field: 'confirmPassword',
      message: AUTH_MESSAGES.CONFIRM_PASSWORD_REQUIRED,
    };
  }

  if (password !== confirmPassword) {
    return {
      field: 'confirmPassword',
      message: AUTH_MESSAGES.PASSWORD_MISMATCH,
    };
  }

  return null;
}

/**
 * Validate full name
 */
export function validateFullName(fullName: string): ValidationError | null {
  if (!fullName || fullName.trim() === '') {
    return {
      field: 'full_name',
      message: AUTH_MESSAGES.FULL_NAME_REQUIRED,
    };
  }

  if (fullName.trim().length < VALIDATION_RULES.FULL_NAME_MIN_LENGTH) {
    return {
      field: 'full_name',
      message: AUTH_MESSAGES.FULL_NAME_TOO_SHORT,
    };
  }

  return null;
}

/**
 * Validate phone number (Vietnamese format)
 */
export function validatePhone(phone: string): ValidationError | null {
  if (!phone || phone.trim() === '') {
    return {
      field: 'phone',
      message: AUTH_MESSAGES.PHONE_REQUIRED,
    };
  }

  if (!VALIDATION_RULES.PHONE_REGEX.test(phone)) {
    return {
      field: 'phone',
      message: AUTH_MESSAGES.PHONE_INVALID,
    };
  }

  return null;
}

/**
 * Validate terms acceptance
 */
export function validateTerms(accepted: boolean): ValidationError | null {
  if (!accepted) {
    return {
      field: 'confirm_terms_and_conditions',
      message: AUTH_MESSAGES.TERMS_REQUIRED,
    };
  }

  return null;
}

/**
 * Validate login form
 */
export function validateLoginForm(email: string, password: string): FormErrors {
  const errors: FormErrors = {};

  const emailError = validateEmail(email);
  if (emailError) errors[emailError.field] = emailError.message;

  if (!password || password.trim() === '') {
    errors.password = AUTH_MESSAGES.PASSWORD_REQUIRED;
  }

  return errors;
}

/**
 * Validate register form
 */
export function validateRegisterForm(
  fullName: string,
  email: string,
  phone: string,
  password: string,
  confirmPassword: string,
  termsAccepted: boolean
): FormErrors {
  const errors: FormErrors = {};

  const fullNameError = validateFullName(fullName);
  if (fullNameError) errors[fullNameError.field] = fullNameError.message;

  const emailError = validateEmail(email);
  if (emailError) errors[emailError.field] = emailError.message;

  const phoneError = validatePhone(phone);
  if (phoneError) errors[phoneError.field] = phoneError.message;

  const passwordError = validatePassword(password);
  if (passwordError) errors[passwordError.field] = passwordError.message;

  const confirmPasswordError = validatePasswordConfirmation(password, confirmPassword);
  if (confirmPasswordError) errors[confirmPasswordError.field] = confirmPasswordError.message;

  const termsError = validateTerms(termsAccepted);
  if (termsError) errors[termsError.field] = termsError.message;

  return errors;
}

/**
 * Validate single field on blur
 */
export function validateFieldOnBlur(
  fieldName: string,
  value: string,
  additionalData?: { [key: string]: any }
): ValidationError | null {
  switch (fieldName) {
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'confirm_password':
    case 'confirmPassword':
      return validatePasswordConfirmation(additionalData?.password || '', value);
    case 'full_name':
      return validateFullName(value);
    case 'phone':
      return validatePhone(value);
    default:
      return null;
  }
}
