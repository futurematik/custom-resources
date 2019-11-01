import { AcmAutoCertProps } from '../AcmAutoCertProps';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';
import { CustomResourceResponse } from '@fmtk/aws-custom-resource';
import * as aws from 'aws-sdk';
import { waitForDnsChallenge } from './waitForDnsChallenge';
import { hash } from '@fmtk/custom-resources-commons';

export async function createUpdateResource(
  props: AcmAutoCertProps,
  event: CloudFormationCustomResourceEvent,
): Promise<CustomResourceResponse> {
  const acm = new aws.ACM({ region: props.region });
  const route53 = new aws.Route53();

  console.log(`requesting cert for ${props.domainName}`);
  if (props.subjectAlternativeNames && props.subjectAlternativeNames.length) {
    console.log(`SANs = ${props.subjectAlternativeNames.join(', ')}`);
  }

  const certRequest = await acm
    .requestCertificate({
      DomainName: props.domainName,
      SubjectAlternativeNames: props.subjectAlternativeNames,
      IdempotencyToken: hash([event.RequestId]).substr(0, 32),
      ValidationMethod: 'DNS',
    })
    .promise();

  if (!certRequest.CertificateArn) {
    throw new Error(`failed to request certificate`);
  }

  console.log(`requested cert with ARN ${certRequest.CertificateArn}`);

  const challenge = await waitForDnsChallenge(certRequest.CertificateArn, acm);

  const dnsChange = await route53
    .changeResourceRecordSets({
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: challenge.Name,
              Type: challenge.Type,
              TTL: 60,
              ResourceRecords: [
                {
                  Value: challenge.Value,
                },
              ],
            },
          },
        ],
      },
      HostedZoneId: props.hostedZoneId,
    })
    .promise();

  console.log('Waiting for DNS records to commit...');
  await route53
    .waitFor('resourceRecordSetsChanged', {
      // Wait up to 10 minutes
      $waiter: {
        delay: 30,
        maxAttempts: 20,
      },
      Id: dnsChange.ChangeInfo.Id,
    })
    .promise();

  console.log('Waiting for validation...');
  await acm
    .waitFor('certificateValidated', {
      // Wait up to 10 minutes
      $waiter: {
        delay: 30,
        maxAttempts: 20,
      },
      CertificateArn: certRequest.CertificateArn,
    })
    .promise();

  return {
    responseStatus: 'SUCCESS',
    physicalResourceId: certRequest.CertificateArn,
    data: {
      CertificateArn: certRequest.CertificateArn,
    },
  };
}
