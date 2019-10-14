import path from 'path';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { S3PutObjectProps, validateS3PutObjectProps } from './S3PutObjectProps';
import { assertValid } from '@fmtk/validation';
import { CustomResource } from '@fmtk/custom-resources-commons';

export class S3PutObject extends CustomResource<S3PutObjectProps> {
  constructor(scope: cdk.Construct, id: string, props: S3PutObjectProps) {
    super(scope, id, {
      name: 'S3PutObject',
      handler: {
        code: lambda.AssetCode.fromAsset(path.resolve(__dirname, '../dist')),
      },
      props: assertValid(props, validateS3PutObjectProps),
    });

    this.handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject*'],
        resources: [`arn:aws:s3:::${props.bucket}/${props.objectName}`],
      }),
    );
  }
}
