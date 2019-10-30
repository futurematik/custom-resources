import path from 'path';
import * as cdk from '@aws-cdk/core';
import { S3PutObject } from '@fmtk/s3-put-object';
import { S3UnpackAsset } from '@fmtk/s3-unpack-asset';
import { DeletableBucket } from '@fmtk/s3-empty-bucket';
import { makeFileAssetRef } from '@fmtk/custom-resources-commons-cdk';

class CustomResourcesTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new DeletableBucket(this, 'Bucket');

    new S3PutObject(this, 'JsonObj', {
      target: { bucket: bucket.bucketName, key: 'test/file.json' },
      contents: {
        one: 1,
        two: 'two',
      },
    });

    const hamlet = makeFileAssetRef(
      this,
      path.resolve(__dirname, '../test-assets/hamlet.txt'),
    );

    new S3PutObject(this, 'HamletObj', {
      target: { bucket: bucket.bucketName, key: 'replacements/hamlet.txt' },
      source: hamlet,
      replacements: [
        { search: 'to', replace: '2' },
        { search: 'of(?!f)', replace: 'OF', regex: true },
      ],
    });

    const asset = makeFileAssetRef(
      this,
      path.resolve(__dirname, '../test-assets'),
    );

    new S3UnpackAsset(this, 'Unpack', {
      source: asset,
      destinationBucket: bucket.bucketName,
      destinationPrefix: 'foo/bar',
    });
  }
}

const app = new cdk.App();
new CustomResourcesTestStack(app, 'CustomResourcesTestStack');
