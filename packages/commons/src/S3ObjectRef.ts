import { properties, text } from '@fmtk/validation';
import s3assets from '@aws-cdk/aws-s3-assets';

export interface S3ObjectRef {
  bucket: string;
  key: string;
}

export const validateS3ObjectRef = properties<S3ObjectRef>({
  bucket: text(),
  key: text(),
});

export function assetRef(asset: s3assets.Asset): S3ObjectRef {
  return {
    bucket: asset.s3BucketName,
    key: asset.s3ObjectKey,
  };
}
