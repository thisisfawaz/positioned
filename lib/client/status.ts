/**
 * Formats a professional's stored availability for display.
 *
 * The database stores enums like OPEN_TO_FULL_TIME. Nothing should hardcode
 * a status string - every surface reads the person's actual selection.
 */
export function availabilityLabel(value?: string | null): string | null {
  if (!value) return null
  if (value === 'NOT_AVAILABLE') return 'Not available'
  return value.replace(/_/g, ' ').toLowerCase()
}

/**
 * Formats a recruiter's recruiting status.
 * Returns null when the field is missing, so callers can omit the badge
 * rather than inventing a status.
 */
export function recruitingLabel(value?: string | null): string | null {
  if (!value) return null
  if (value === 'NOT_RECRUITING') return 'Not recruiting'
  if (value === 'CURRENTLY_RECRUITING') return 'Currently recruiting'
  return null
}
