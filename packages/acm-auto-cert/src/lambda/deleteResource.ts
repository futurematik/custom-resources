import { AcmAutoCertProps } from '../AcmAutoCertProps';
import { CustomResourceResponse } from '@fmtk/aws-custom-resource';
import * as aws from 'aws-sdk';
import { CloudFormationCustomResourceDeleteEvent } from 'aws-lambda';
import { waitForCertificateUse } from './waitForCertificateUse';

export async function deleteResource(
  props: AcmAutoCertProps,
  event: CloudFormationCustomResourceDeleteEvent,
): Promise<CustomResourceResponse> {
  const acm = new aws.ACM({ region: props.region });
  const arn = event.PhysicalResourceId;

  try {
    await waitForCertificateUse(arn, acm);
    await acm.deleteCertificate({ CertificateArn: arn }).promise();
  } catch (e) {
    // don't throw if resource has already been removed
    if (e.code !== 'ResourceNotFoundException') {
      throw e;
    }
  }

  return {
    responseStatus: 'SUCCESS',
    physicalResourceId: arn,
  };
}
