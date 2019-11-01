import path from 'path';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { AcmAutoCertProps, validateAcmAutoCertProps } from './AcmAutoCertProps';
import { assertValid } from '@fmtk/validation';
import { CustomResource } from '@fmtk/custom-resources-commons-cdk';

export class AcmAutoCert extends CustomResource<AcmAutoCertProps> {
  constructor(scope: cdk.Construct, id: string, props: AcmAutoCertProps) {
    super(scope, id, {
      name: 'AcmAutoCert',
      handler: {
        code: lambda.AssetCode.fromAsset(path.resolve(__dirname, '../dist')),
      },
      props: assertValid(props, validateAcmAutoCertProps),
    });

    this.handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'acm:RequestCertificate',
          'acm:DescribeCertificate',
          'acm:DeleteCertificate',
        ],
        resources: ['*'],
      }),
    );

    this.handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['route53:GetChange'],
        resources: ['*'],
      }),
    );

    this.handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['route53:changeResourceRecordSets'],
        resources: [`arn:aws:route53:::hostedzone/${props.hostedZoneId}`],
      }),
    );
  }

  public get certificateArn(): string {
    return this.resource.getAtt('CertificateArn').toString();
  }
}
