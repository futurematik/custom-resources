import { properties, text, optional } from '@fmtk/validation';
import {
  S3ObjectRef,
  validateS3ObjectRef,
} from '@fmtk/custom-resources-commons';

export interface S3UnpackAssetProps {
  source: S3ObjectRef;
  destinationBucket: string;
  destinationPrefix?: string;
}

export const validateS3UnpackAssetProps = properties<S3UnpackAssetProps>(
  {
    source: validateS3ObjectRef,
    destinationBucket: text(),
    destinationPrefix: optional(text()),
  },
  true,
);
