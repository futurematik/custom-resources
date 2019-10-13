# S3UnpackAsset

Upload a zip and unpack it to the specified bucket.

```typescript
const bucket = new s3.Bucket(this, 'Bucket');

const asset = makeFileAsset(this, 'path/to/folder/');

new S3UnpackAsset(this, 'Unpack', {
  sourceBucket: asset.s3BucketName,
  sourceObjectName: asset.s3ObjectKey,
  destinationBucket: bucket.bucketName,
  destinationPrefix: 'foo/bar',
});
```
