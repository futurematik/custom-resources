import crypto from 'crypto';

export function hash(data: Iterable<string | Buffer>): string {
  const sha1 = crypto.createHash('sha1');
  for (const part of data) {
    sha1.update(part);
  }
  return sha1.digest('hex');
}
