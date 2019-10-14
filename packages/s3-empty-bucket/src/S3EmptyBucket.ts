import path from 'path';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import {
  S3EmptyBucketProps,
  validateS3EmptyBucketProps,
} from './S3EmptyBucketProps';
import { assertValid } from '@fmtk/validation';
import { CustomResource } from '@fmtk/custom-resources-commons-cdk';

export class S3EmptyBucket extends CustomResource<S3EmptyBucketProps> {
  constructor(scope: cdk.Construct, id: string, props: S3EmptyBucketProps) {
    super(scope, id, {
      handler: {
        code: lambda.AssetCode.fromAsset(path.resolve(__dirname, '../dist')),
      },
      name: 'S3EmptyBucket',
      props: assertValid(props, validateS3EmptyBucketProps),
    });

    this.handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:ListBucket*'],
        resources: [`arn:aws:s3:::${props.bucket}`],
      }),
    );

    this.handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:DeleteObject*'],
        resources: [`arn:aws:s3:::${props.bucket}/*`],
      }),
    );
  }
}
