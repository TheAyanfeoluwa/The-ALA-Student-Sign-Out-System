/**
 * Input Sanitization Utilities
 * Prevents XSS (Cross-Site Scripting) and SQL Injection attacks
 */

/**
 * Sanitizes input to prevent XSS attacks
 * Escapes HTML special characters
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  const map: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  const reg = /[&<>"'/]/ig;
  return input.replace(reg, (match) => map[match]);
}

/**
 * Sanitizes email input
 * Validates email format and removes dangerous characters
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  // Remove any HTML tags
  let sanitized = email.replace(/<[^>]*>/g, '');
  
  // Remove scripts and dangerous content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim().toLowerCase();
  
  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitizes password input
 * Removes dangerous characters while preserving password complexity
 */
export function sanitizePassword(password: string): string {
  if (!password) return '';
  
  // Remove HTML tags
  let sanitized = password.replace(/<[^>]*>/g, '');
  
  // Remove script attempts
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  return sanitized;
}

/**
 * Prevents SQL injection by escaping special characters
 * Note: In a real application, use parameterized queries instead
 */
export function preventSQLInjection(input: string): string {
  if (!input) return '';
  
  // Escape single quotes
  let sanitized = input.replace(/'/g, "''");
  
  // Remove dangerous SQL keywords
  const dangerousPatterns = [
    /(\s|^)(DROP|DELETE|TRUNCATE|UPDATE|INSERT|ALTER|CREATE|EXEC|EXECUTE)(\s|$)/gi,
    /--/g,
    /;/g,
    /\/\*/g,
    /\*\//g,
  ];
  
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized;
}

/**
 * Comprehensive input validation and sanitization
 */
export function validateAndSanitize(input: string, type: 'email' | 'password' | 'text' = 'text'): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!input) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Input cannot be empty'
    };
  }

  // Check for excessively long inputs (potential DoS attack)
  if (input.length > 1000) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Input is too long'
    };
  }

  let sanitized = '';
  let isValid = true;
  let error: string | undefined;

  switch (type) {
    case 'email':
      sanitized = sanitizeEmail(input);
      if (!sanitized) {
        isValid = false;
        error = 'Invalid email format';
      }
      break;
      
    case 'password':
      sanitized = sanitizePassword(input);
      if (sanitized.length < 6) {
        isValid = false;
        error = 'Password must be at least 6 characters';
      }
      break;
      
    case 'text':
    default:
      sanitized = sanitizeInput(preventSQLInjection(input));
      break;
  }

  return { isValid, sanitized, error };
}

/**
 * Rate limiting helper - tracks login attempts
 */
export interface LoginAttemptTracker {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, LoginAttemptTracker>();

export function trackLoginAttempt(email: string): {
  allowed: boolean;
  attemptsRemaining: number;
  resetIn?: number;
} {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  let tracker = loginAttempts.get(email);
  
  if (!tracker) {
    tracker = {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now
    };
    loginAttempts.set(email, tracker);
    return {
      allowed: true,
      attemptsRemaining: maxAttempts - 1
    };
  }

  // Reset if window has passed
  if (now - tracker.firstAttempt > windowMs) {
    tracker = {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now
    };
    loginAttempts.set(email, tracker);
    return {
      allowed: true,
      attemptsRemaining: maxAttempts - 1
    };
  }

  // Increment attempts
  tracker.attempts++;
  tracker.lastAttempt = now;
  loginAttempts.set(email, tracker);

  const allowed = tracker.attempts <= maxAttempts;
  const attemptsRemaining = Math.max(0, maxAttempts - tracker.attempts);
  const resetIn = allowed ? undefined : windowMs - (now - tracker.firstAttempt);

  return {
    allowed,
    attemptsRemaining,
    resetIn
  };
}

export function resetLoginAttempts(email: string): void {
  loginAttempts.delete(email);
}
