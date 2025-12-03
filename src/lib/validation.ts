/**
 * Validation utilities for user input
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  return { isValid: true };
};

/**
 * Validate username format
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username || username.trim() === '') {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Username must be at most 20 characters' };
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true };
};

/**
 * Validate password confirmation
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

/**
 * Validate signup form
 */
export const validateSignupForm = (
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  const usernameResult = validateUsername(username);
  if (!usernameResult.isValid) return usernameResult;

  const emailResult = validateEmail(email);
  if (!emailResult.isValid) return emailResult;

  const passwordResult = validatePassword(password);
  if (!passwordResult.isValid) return passwordResult;

  const matchResult = validatePasswordMatch(password, confirmPassword);
  if (!matchResult.isValid) return matchResult;

  return { isValid: true };
};

/**
 * Validate login form
 */
export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) return emailResult;

  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  return { isValid: true };
};

/**
 * Sanitize string input (remove leading/trailing whitespace)
 */
export const sanitizeInput = (input: string): string => {
  return input?.trim() ?? '';
};

/**
 * Validate score (must be non-negative integer)
 */
export const validateScore = (score: number): ValidationResult => {
  if (typeof score !== 'number' || isNaN(score)) {
    return { isValid: false, error: 'Score must be a number' };
  }

  if (score < 0) {
    return { isValid: false, error: 'Score cannot be negative' };
  }

  if (!Number.isInteger(score)) {
    return { isValid: false, error: 'Score must be an integer' };
  }

  return { isValid: true };
};
