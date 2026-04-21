const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string): boolean {
  const v = email.trim();
  if (v.length < 5 || v.length > 254) return false;
  return EMAIL_RE.test(v);
}

/**
 * Returns a user-facing error message when invalid, otherwise `null`.
 * Rules: at least 10 characters, upper, lower, digit, and a non-alphanumeric symbol.
 */
export function getPasswordRuleError(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Add at least one lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Add at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Add at least one symbol (e.g. !@#$%).";
  return null;
}

export function getEmailFieldError(email: string): string | null {
  const v = email.trim();
  if (!v) return "Email is required.";
  if (!isValidEmail(v)) return "Enter a valid email address.";
  return null;
}

export function getConfirmPasswordError(password: string, confirm: string): string | null {
  if (!confirm) return "Confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}
