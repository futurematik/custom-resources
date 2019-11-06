export const validLogRetentionValues = [
  1,
  3,
  5,
  7,
  14,
  30,
  60,
  90,
  120,
  150,
  180,
  365,
  400,
  545,
  731,
  1827,
  3653,
];

/**
 * Get the nearest valid value which is at least the given number of days.
 */
export function logRetentionDays(days: number): number {
  for (let i = 0; i < logRetentionDays.length; ++i) {
    if (days <= validLogRetentionValues[i]) {
      return validLogRetentionValues[i];
    }
  }
  return validLogRetentionValues[validLogRetentionValues.length - 1];
}
