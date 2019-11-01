import * as aws from 'aws-sdk';
import { backoff } from '@fmtk/custom-resources-commons';

export async function waitForDnsChallenge(
  arn: string,
  acm: aws.ACM,
  maxAttempts = 10,
): Promise<aws.ACM.ResourceRecord> {
  console.log(`waiting for ACM to provide DNS challenge details`);

  for (let i = 0; i < maxAttempts; ++i) {
    const cert = await acm
      .describeCertificate({ CertificateArn: arn })
      .promise();

    if (!cert.Certificate) {
      throw new Error(`certificate ${arn} not found`);
    }

    const options = cert.Certificate.DomainValidationOptions;

    if (options && options.length && options[0].ResourceRecord) {
      return options[0].ResourceRecord;
    }

    await backoff(i, 1000);
  }

  throw new Error(
    `couldn't get DNS Challenge details after ${maxAttempts} attempts`,
  );
}
