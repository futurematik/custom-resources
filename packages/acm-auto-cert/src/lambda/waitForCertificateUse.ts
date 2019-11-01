import * as aws from 'aws-sdk';
import { backoff } from '@fmtk/custom-resources-commons';

export async function waitForCertificateUse(
  arn: string,
  acm: aws.ACM,
  maxAttempts = 10,
): Promise<void> {
  console.log(`waiting for certificate ${arn} to become unused`);

  for (let i = 0; i < maxAttempts; ++i) {
    const cert = await acm
      .describeCertificate({ CertificateArn: arn })
      .promise();

    if (!cert.Certificate) {
      return;
    }
    if (!cert.Certificate.InUseBy || !cert.Certificate.InUseBy.length) {
      return;
    }

    await backoff(i, 1000);
  }

  throw new Error(
    `gave up waiting for certificate to be unused after ${maxAttempts} attempts`,
  );
}
