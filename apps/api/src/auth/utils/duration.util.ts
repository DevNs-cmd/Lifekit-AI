/**
 * Parses a duration string (e.g. '15m', '7d', '24h') and returns the equivalent milliseconds.
 * Supported units: s (seconds), m (minutes), h (hours), d (days).
 * @param duration The duration string to parse
 * @returns The duration in milliseconds
 */
export function parseDuration(duration: string): number {
  const regex = /^(\d+)([smhd])$/;
  const match = duration.trim().match(regex);
  
  if (!match) {
    // Default fallback to 7 days if format is unrecognized
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}
