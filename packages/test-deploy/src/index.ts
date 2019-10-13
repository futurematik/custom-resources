import path from 'path';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { S3PutObject } from '@fmtk/s3-put-object';
import { S3UnpackAsset } from '@fmtk/s3-unpack-asset';
import { makeFileAsset } from '@fmtk/custom-resources-commons';

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

    const asset = makeFileAsset(
      this,
      path.resolve(__dirname, '../test-assets'),
    );

    new S3UnpackAsset(this, 'Unpack', {
      sourceBucket: asset.s3BucketName,
      sourceObjectName: asset.s3ObjectKey,
      destinationBucket: bucket.bucketName,
      destinationPrefix: 'foo/bar',
    });
  }
}

const app = new cdk.App();
new CustomResourcesTestStack(app, 'CustomResourcesTestStack');
