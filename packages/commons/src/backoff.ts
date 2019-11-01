/**
 * Exponential back-off with configurable base and jitter.
 */
export async function backoff(
  iteration: number,
  baseMs: number,
  jitter = 0.1,
): Promise<void> {
  const ms = Math.pow(2, iteration) * baseMs * (1 + jitter * Math.random());
  await new Promise(resolve => setTimeout(resolve, ms));
}
