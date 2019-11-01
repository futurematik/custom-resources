import path from 'path';
import * as cdk from '@aws-cdk/core';
import { S3PutObject } from '@fmtk/s3-put-object';
import { S3UnpackAsset } from '@fmtk/s3-unpack-asset';
import { DeletableBucket } from '@fmtk/s3-empty-bucket';
import { makeFileAssetRef } from '@fmtk/custom-resources-commons-cdk';
import { CfStaticSite } from '@fmtk/cf-static-site';

class CustomResourcesTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new DeletableBucket(this, 'Bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
    });

    new S3PutObject(this, 'JsonObj', {
      target: { bucket: bucket.bucketName, key: 'test/file.json' },
      contents: {
        one: 1,
        two: 'two',
      },
    });

    if (this.node.tryGetContext('bucketonly')) {
      return;
    }

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
      metadata: {
        'cache-control': 'public, max-age=3600',
      },
    });

    new S3UnpackAsset(this, 'Unpack', {
      source: makeFileAssetRef(this, path.resolve(__dirname, '../test-assets')),
      destinationBucket: bucket.bucketName,
      destinationPrefix: 'foo/bar',
      metadata: [
        {
          glob: 'afolder/**/*',
          metadata: { 'cache-control': 'public, max-age=3600' },
        },
        { glob: '*', metadata: { 'cache-control': 'public, max-age=60' } },
      ],
    });

    const domain = this.node.tryGetContext('domain');
    const cloudfront = this.node.tryGetContext('cloudfront');

    if (domain || cloudfront) {
      let hostedZoneId: string | undefined;
      let domainName: string | undefined;

      if (domain) {
        [hostedZoneId, domainName] = domain.split(':');
      }

      new CfStaticSite(this, 'StaticSite', {
        source: makeFileAssetRef(
          this,
          path.resolve(__dirname, '../test-assets'),
        ),
        domain: domainName,
        hostedZoneId,
      });
    }
  }
}

const app = new cdk.App();
const dist = app.node.tryGetContext('dist');
const baseName = 'CustomResourcesTestStack';
new CustomResourcesTestStack(app, dist ? baseName + '-' + dist : baseName);
