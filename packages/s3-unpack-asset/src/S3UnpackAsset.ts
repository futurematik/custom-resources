import path from 'path';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import {
  S3UnpackAssetProps,
  validateS3UnpackAssetProps,
} from './S3UnpackAssetProps';
import { assertValid } from '@fmtk/validation';
import { CustomResource } from '@fmtk/custom-resources-commons-cdk';

export class S3UnpackAsset extends CustomResource<S3UnpackAssetProps> {
  constructor(scope: cdk.Construct, id: string, props: S3UnpackAssetProps) {
    super(scope, id, {
      handler: {
        code: lambda.AssetCode.fromAsset(path.resolve(__dirname, '../dist')),
      },
      name: 'S3UnpackAsset',
      props: assertValid(props, validateS3UnpackAssetProps),
    });

    this.handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject*'],
        resources: [`arn:aws:s3:::${props.source.bucket}/${props.source.key}`],
      }),
    );

    this.handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject*'],
        resources: [`arn:aws:s3:::${props.destinationBucket}/*`],
      }),
    );
  }
}
