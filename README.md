# Custom Resources

A collection of custom AWS CDK resources.

## S3PutObject

Write an object with the given content to an S3 bucket. If an object is supplied to the data prop, it will be serialized, but note that numbers and booleans are converted to strings by CloudFormation.

```typescript
const bucket = new s3.Bucket(this, 'Bucket');

new S3PutObject(this, 'PutObj', {
  bucket: bucket.bucketName,
  objectName: 'test/file.json',
  // the data object will be serialized
  data: {
    one: 1, // but this will be written as a string
    two: 'two',
  },
});
```
