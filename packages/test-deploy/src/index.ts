import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { S3PutObject } from '@fmtk/s3-put-object';

class CustomResourcesTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'Bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new S3PutObject(this, 'PutObj', {
      bucket: bucket.bucketName,
      objectName: 'test/file.json',
      data: {
        one: 1,
        two: 'two',
      },
    });
  }
}

const app = new cdk.App();
new CustomResourcesTestStack(app, 'CustomResourcesTestStack');
