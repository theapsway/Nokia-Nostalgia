import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePasswordMatch,
  validateSignupForm,
  validateLoginForm,
  sanitizeInput,
  validateScore,
} from '../validation';

describe('Validation - Email', () => {
  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('test@example.com').isValid).toBe(true);
      expect(validateEmail('user.name@domain.org').isValid).toBe(true);
      expect(validateEmail('snake@game.com').isValid).toBe(true);
      expect(validateEmail('a@b.co').isValid).toBe(true);
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should reject whitespace-only email', () => {
      const result = validateEmail('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('notanemail').isValid).toBe(false);
      expect(validateEmail('missing@domain').isValid).toBe(false);
      expect(validateEmail('@nodomain.com').isValid).toBe(false);
      expect(validateEmail('spaces in@email.com').isValid).toBe(false);
    });

    it('should return proper error message for invalid format', () => {
      const result = validateEmail('invalid');
      expect(result.error).toBe('Invalid email format');
    });
  });
});

describe('Validation - Password', () => {
  describe('validatePassword', () => {
    it('should accept valid passwords', () => {
      expect(validatePassword('123456').isValid).toBe(true);
      expect(validatePassword('password123').isValid).toBe(true);
      expect(validatePassword('verylongpassword').isValid).toBe(true);
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is required');
    });

    it('should reject short passwords', () => {
      expect(validatePassword('12345').isValid).toBe(false);
      expect(validatePassword('abc').isValid).toBe(false);
      expect(validatePassword('a').isValid).toBe(false);
    });

    it('should return proper error for short password', () => {
      const result = validatePassword('12345');
      expect(result.error).toBe('Password must be at least 6 characters');
    });
  });
});

describe('Validation - Username', () => {
  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateUsername('player1').isValid).toBe(true);
      expect(validateUsername('Snake_Master').isValid).toBe(true);
      expect(validateUsername('user123').isValid).toBe(true);
      expect(validateUsername('ABC').isValid).toBe(true);
    });

    it('should reject empty username', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('should reject too short usernames', () => {
      expect(validateUsername('ab').isValid).toBe(false);
      expect(validateUsername('a').isValid).toBe(false);
    });

    it('should reject too long usernames', () => {
      const longUsername = 'a'.repeat(21);
      expect(validateUsername(longUsername).isValid).toBe(false);
    });

    it('should reject usernames with special characters', () => {
      expect(validateUsername('user@name').isValid).toBe(false);
      expect(validateUsername('user name').isValid).toBe(false);
      expect(validateUsername('user-name').isValid).toBe(false);
      expect(validateUsername('user.name').isValid).toBe(false);
    });

    it('should allow underscores', () => {
      expect(validateUsername('user_name').isValid).toBe(true);
      expect(validateUsername('_player_').isValid).toBe(true);
    });
  });
});

describe('Validation - Password Match', () => {
  describe('validatePasswordMatch', () => {
    it('should accept matching passwords', () => {
      expect(validatePasswordMatch('password123', 'password123').isValid).toBe(true);
      expect(validatePasswordMatch('abc', 'abc').isValid).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      const result = validatePasswordMatch('password1', 'password2');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Passwords do not match');
    });

    it('should be case-sensitive', () => {
      expect(validatePasswordMatch('Password', 'password').isValid).toBe(false);
    });
  });
});

describe('Validation - Signup Form', () => {
  describe('validateSignupForm', () => {
    it('should accept valid signup data', () => {
      const result = validateSignupForm('player1', 'test@example.com', 'password123', 'password123');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid username', () => {
      const result = validateSignupForm('ab', 'test@example.com', 'password123', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Username');
    });

    it('should reject invalid email', () => {
      const result = validateSignupForm('player1', 'invalid', 'password123', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should reject invalid password', () => {
      const result = validateSignupForm('player1', 'test@example.com', '123', '123');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Password');
    });

    it('should reject mismatched passwords', () => {
      const result = validateSignupForm('player1', 'test@example.com', 'password1', 'password2');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('match');
    });
  });
});

describe('Validation - Login Form', () => {
  describe('validateLoginForm', () => {
    it('should accept valid login data', () => {
      const result = validateLoginForm('test@example.com', 'password123');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validateLoginForm('invalid', 'password123');
      expect(result.isValid).toBe(false);
    });

    it('should reject empty password', () => {
      const result = validateLoginForm('test@example.com', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is required');
    });
  });
});

describe('Validation - Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
      expect(sanitizeInput('\ttest\n')).toBe('test');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput('   ')).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    it('should preserve internal spaces', () => {
      expect(sanitizeInput('hello world')).toBe('hello world');
    });
  });
});

describe('Validation - Score', () => {
  describe('validateScore', () => {
    it('should accept valid scores', () => {
      expect(validateScore(0).isValid).toBe(true);
      expect(validateScore(100).isValid).toBe(true);
      expect(validateScore(999999).isValid).toBe(true);
    });

    it('should reject negative scores', () => {
      const result = validateScore(-10);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Score cannot be negative');
    });

    it('should reject non-integer scores', () => {
      const result = validateScore(10.5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Score must be an integer');
    });

    it('should reject NaN', () => {
      const result = validateScore(NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Score must be a number');
    });

    it('should reject non-numbers', () => {
      const result = validateScore('100' as any);
      expect(result.isValid).toBe(false);
    });
  });
});
