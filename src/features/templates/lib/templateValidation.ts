/** Lowercase English letters with single underscores between segments (e.g. `welcome_template`). */
export const TEMPLATE_NAME_PATTERN = /^[a-z]+(_[a-z]+)*$/;

export function isValidTemplateName(name: string): boolean {
  return TEMPLATE_NAME_PATTERN.test(name.trim());
}

/**
 * E.164 international format (e.g. +14155552671, +919876543210).
 * + followed by 2–15 digits, first digit 1–9.
 */
export const E164_PHONE_PATTERN = /^\+[1-9]\d{1,14}$/;

export function isE164Phone(phone: string): boolean {
  return E164_PHONE_PATTERN.test(phone.replace(/\s/g, ""));
}

/** Variable placeholder inside `{{ }}`: letters, digits, underscores; must start with a letter. */
export const TEMPLATE_VAR_NAME_PATTERN = /^[a-z][a-z0-9_]*$/;

export function sanitizeTemplateVarName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^[^a-z]+/, "");
}
