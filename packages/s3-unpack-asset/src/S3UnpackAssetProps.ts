import { properties, text, optional } from '@fmtk/validation';

export interface S3UnpackAssetProps {
  sourceBucket: string;
  sourceObjectName: string;
  destinationBucket: string;
  destinationPrefix?: string;
}

export const validateS3UnpackAssetProps = properties<S3UnpackAssetProps>(
  {
    sourceBucket: text(),
    sourceObjectName: text(),
    destinationBucket: text(),
    destinationPrefix: optional(text()),
  },
  true,
);
