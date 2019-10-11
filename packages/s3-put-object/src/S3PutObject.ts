import path from 'path';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { S3PutObjectProps, validateS3PutObjectProps } from './S3PutObjectProps';
import { assertValid } from '@fmtk/validation';

export class S3PutObject extends cdk.Resource {
  public readonly resource: cdk.CfnResource;

  constructor(scope: cdk.Construct, id: string, props: S3PutObjectProps) {
    super(scope, id);

    assertValid(props, validateS3PutObjectProps);

    const handler = new lambda.SingletonFunction(this, 'Handler', {
      code: lambda.AssetCode.fromAsset(path.resolve(__dirname, '../dist')),
      handler: 'lambda.handler',
      uuid: 'f8a3c9c6-b570-43c0-8914-d814a61ed98f',
      runtime: lambda.Runtime.NODEJS_10_X,
      timeout: cdk.Duration.minutes(15),
    });

    handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [`arn:aws:s3:::${props.bucket}/${props.objectName}`],
      }),
    );

    this.resource = new cdk.CfnResource(this, 'Resource', {
      type: 'Custom::S3PutObject',
      properties: {
        ServiceToken: handler.functionArn,
        ...props,
      },
    });
  }
}
