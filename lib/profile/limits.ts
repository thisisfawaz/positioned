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
