import path from 'path';
import * as cdk from '@aws-cdk/core';
import { S3PutObject } from '@fmtk/s3-put-object';
import { S3UnpackAsset } from '@fmtk/s3-unpack-asset';
import { DeletableBucket } from '@fmtk/s3-empty-bucket';
import { makeFileAsset } from '@fmtk/custom-resources-commons-cdk';

class CustomResourcesTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new DeletableBucket(this, 'Bucket');

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
