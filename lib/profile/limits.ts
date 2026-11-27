/**
 * Profile text limits.
 *
 * BIO   (stored in `title`) is the short line under the name in the header, so
 *       it is kept to a single short label.
 * ABOUT (stored in `bio`) is the full text in the About tab.
 *
 * These are enforced in the FORMS (maxLength + a live counter) AND in the
 * SERVER ACTIONS, so a crafted request cannot store an overlong value.
 */
export const BIO_MAX = 60
export const ABOUT_MAX = 1000

/** Username rules: 1-15 chars, only letters, digits and underscore. */
export const USERNAME_MAX = 15
export const USERNAME_PATTERN = /^[A-Za-z0-9_]*$/

/** Display name limit (includes spaces). */
export const NAME_MAX = 24

/** Returns an error message for an invalid username, or null when valid. */
export function usernameError(raw: string): string | null {
  const value = raw.replace(/^@/, '')
  if (value.length > USERNAME_MAX) {
    return `Username must be ${USERNAME_MAX} characters or fewer.`
  }
  if (!USERNAME_PATTERN.test(value)) {
    return 'Username can only use letters, numbers and underscores.'
  }
  return null
}
