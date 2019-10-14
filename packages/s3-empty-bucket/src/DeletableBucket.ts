import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { S3EmptyBucket } from './S3EmptyBucket';

export class DeletableBucket extends s3.Bucket {
  public readonly emptyBucketResource: S3EmptyBucket;

  constructor(scope: cdk.Construct, id: string, props?: s3.BucketProps) {
    super(scope, id, props);

    this.emptyBucketResource = new S3EmptyBucket(this, 'EmptyBucket', {
      bucket: this.bucketName,
      emptyOnDelete: true,
    });
  }
}
