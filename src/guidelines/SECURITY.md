# Security Implementation Guide

## Overview

The African Leadership Academy Clearance System implements comprehensive security measures to protect against common web vulnerabilities and unauthorized access attempts.

## Implemented Security Features

### 1. Input Validation & Sanitization

**Location:** `/utils/inputSanitization.ts`

#### XSS (Cross-Site Scripting) Protection
- All user inputs are sanitized to prevent HTML/JavaScript injection
- Special characters (`<`, `>`, `"`, `'`, `&`, `/`) are escaped
- HTML tags are stripped from inputs

#### SQL Injection Prevention
- Dangerous SQL keywords are filtered out
- Special characters are escaped
- Parameterized queries should be used in production (backend)

#### Implementation:
```typescript
import { validateAndSanitize } from '../utils/inputSanitization';

// Email validation
const emailValidation = validateAndSanitize(email, 'email');
if (!emailValidation.isValid) {
  // Handle invalid input
}

// Password validation
const passwordValidation = validateAndSanitize(password, 'password');
```

### 2. reCAPTCHA Bot Protection

**Location:** `/components/LoginForm.tsx`

#### Features:
- Automatically triggered after 2 failed login attempts
- Mock implementation for development (replace with Google reCAPTCHA v2/v3 in production)
- Prevents automated brute-force attacks
- Verifies human interaction

#### Production Implementation:
```typescript
// Replace mock with actual reCAPTCHA
import ReCAPTCHA from "react-google-recaptcha";

<ReCAPTCHA
  sitekey="YOUR_SITE_KEY"
  onChange={onRecaptchaChange}
/>
```

### 3. Brute-Force Protection

**Location:** `/utils/inputSanitization.ts` - `trackLoginAttempt()`

#### Login Throttling:
- Tracks failed login attempts per email
- Maximum 5 attempts allowed within 15-minute window
- Real-time attempt counter displayed to user
- Automatic reset after time window expires

#### Account Lockout:
- Account automatically locks after 5 failed attempts
- 30-minute automatic unlock timer
- Manual admin unlock option available
- Lock status persists across sessions

### 4. Admin Unlock System

**Location:** `/components/AdminUnlockRequests.tsx`

#### Features:
- Users can request immediate unlock from admins
- Admin dashboard shows pending unlock requests
- Admins can approve/reject with notes
- Full audit trail of unlock requests
- Real-time notifications

#### Workflow:
1. User account locks after 5 failed attempts
2. User can submit unlock request with reason
3. Admin reviews request in Security tab
4. Admin approves/rejects with notes
5. System automatically unlocks account or maintains lock
6. Audit log created for compliance

### 5. Password Security

**Location:** `/components/LoginForm.tsx`

#### Features:
- Password masking (type="password")
- Toggle visibility option (eye icon)
- Minimum 6 character requirement (increase in production)
- Protected from copy/paste logging

#### Production Recommendations:
```typescript
// Implement strong password requirements
const passwordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true
};
```

### 6. Session Security

**Location:** `/hooks/useAuth.tsx`

#### Current Implementation:
- Session data stored in memory (React state)
- Automatic logout on tab close

#### Production Recommendations:
- Use HTTP-only cookies for session tokens
- Implement JWT with short expiration (15-30 minutes)
- Refresh token rotation
- CSRF token protection
- Secure cookie flags (Secure, SameSite)

## Security Configuration

### Login Attempt Tracking

```typescript
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  ATTEMPT_WINDOW: 15 * 60 * 1000,   // 15 minutes
  SHOW_RECAPTCHA_AFTER: 2,          // attempts
  MIN_PASSWORD_LENGTH: 6,           // Increase to 12+ in production
};
```

### Input Validation Rules

```typescript
const VALIDATION_RULES = {
  EMAIL_MAX_LENGTH: 254,
  PASSWORD_MAX_LENGTH: 128,
  INPUT_MAX_LENGTH: 1000,
  ALLOWED_EMAIL_DOMAINS: [
    'alastudents.org',
    'africanleadershipacademy.org'
  ]
};
```

## User Data Protection

### Data Store Security

**Location:** `/hooks/useDataStore.tsx`

#### Features:
- User lock status tracked in user object
- Login attempts counter
- Lock expiration timestamps
- Lock reason logging
- Admin unlock request history

#### User Object Security Fields:
```typescript
interface User {
  loginAttempts?: number;
  lockedUntil?: string;
  isLocked?: boolean;
  lastLoginAttempt?: string;
  lockReason?: string;
}
```

## Admin Security Dashboard

**Location:** `/components/SimplifiedAdminDashboard.tsx` → Security Tab

### Features:
1. **Real-time Monitoring**
   - Pending unlock requests counter
   - Badge notification for new requests
   - Request timestamp tracking

2. **Request Management**
   - View all pending unlock requests
   - User details and attempt history
   - Approve/reject with admin notes
   - Historical record of all actions

3. **Audit Trail**
   - Who approved/rejected requests
   - When actions were taken
   - Admin notes for each action
   - Failed attempt counts

## Security Best Practices

### For Development:

1. **Never commit sensitive data**
   - No real passwords in mock data
   - No API keys in code
   - Use environment variables

2. **Input validation everywhere**
   - Validate on client AND server
   - Sanitize before storage
   - Escape on output

3. **Test security features**
   - Try SQL injection patterns
   - Test XSS attempts
   - Verify lockout mechanisms

### For Production:

1. **Backend Validation**
   ```typescript
   // All validation must be repeated on backend
   // Never trust client-side validation alone
   ```

2. **HTTPS Only**
   - Force HTTPS for all connections
   - Set Secure flag on cookies
   - Implement HSTS headers

3. **Rate Limiting**
   ```typescript
   // Implement server-side rate limiting
   // Use tools like express-rate-limit
   ```

4. **Database Security**
   - Use parameterized queries
   - Implement prepared statements
   - Encrypt sensitive data at rest
   - Use database user with minimal privileges

5. **Logging & Monitoring**
   ```typescript
   // Log all security events
   - Failed login attempts
   - Account lockouts
   - Admin unlock actions
   - Suspicious activity patterns
   ```

6. **Regular Security Audits**
   - Dependency vulnerability scanning
   - Penetration testing
   - Code security review
   - Compliance audits

## Webhook Security

**Location:** `/services/webhookService.ts`

### Production Implementation:

```typescript
// Verify webhook signatures
const verifyWebhookSignature = (payload: string, signature: string): boolean => {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
};

// Rate limit webhook endpoints
// Implement retry logic with exponential backoff
// Log all webhook attempts
```

## Compliance Considerations

### Data Privacy (GDPR, FERPA)

1. **Data Minimization**
   - Only collect necessary data
   - Regular data cleanup
   - Student data access controls

2. **Right to Access**
   - Students can view their data
   - Export functionality provided (CSV)
   - Data portability

3. **Right to Erasure**
   - Implement account deletion
   - Data retention policies
   - Secure data disposal

4. **Audit Logging**
   - Who accessed what data
   - When data was modified
   - Administrative actions

## Testing Security Features

### Manual Testing Checklist:

- [ ] Try logging in with invalid credentials 5 times
- [ ] Verify account locks after 5 attempts
- [ ] Confirm reCAPTCHA appears after 2 attempts
- [ ] Test automatic unlock after 30 minutes
- [ ] Submit unlock request as locked user
- [ ] Approve unlock request as admin
- [ ] Reject unlock request as admin
- [ ] Verify input sanitization works
- [ ] Test password visibility toggle
- [ ] Check CSV export includes security data

### Automated Testing:

```typescript
describe('Security Features', () => {
  test('should lock account after 5 failed attempts', () => {
    // Test implementation
  });

  test('should sanitize XSS attempts', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(malicious);
    expect(sanitized).not.toContain('<script>');
  });

  test('should reject SQL injection patterns', () => {
    const malicious = "'; DROP TABLE users; --";
    const sanitized = preventSQLInjection(malicious);
    expect(sanitized).not.toContain('DROP');
  });
});
```

## Security Incident Response

### If Security Breach Detected:

1. **Immediate Actions**
   - Lock all affected accounts
   - Disable compromised features
   - Notify security team

2. **Investigation**
   - Review audit logs
   - Identify attack vector
   - Assess data exposure

3. **Remediation**
   - Patch vulnerabilities
   - Force password resets
   - Update security measures

4. **Communication**
   - Notify affected users
   - Report to authorities if required
   - Document incident

## Contact

For security concerns or to report vulnerabilities:
- Email: security@africanleadershipacademy.org
- Use responsible disclosure practices
- Allow 90 days for fixes before public disclosure

## Version History

- v1.0 (2024-11-04): Initial security implementation
  - Input sanitization
  - reCAPTCHA protection
  - Brute-force prevention
  - Admin unlock system
  - Audit logging
