import { properties, text, optional, array } from '@fmtk/validation';
import {
  S3ObjectRef,
  validateS3ObjectRef,
  Metadata,
  validateMetadata,
} from '@fmtk/custom-resources-commons';

export interface MetadataGlob {
  glob: string;
  metadata: Metadata;
}

export const validateMetadataGlob = properties<MetadataGlob>({
  glob: text(),
  metadata: validateMetadata,
});

export interface S3UnpackAssetProps {
  destinationBucket: string;
  destinationPrefix?: string;
  metadata?: MetadataGlob[];
  source: S3ObjectRef;
}

export const validateS3UnpackAssetProps = properties<S3UnpackAssetProps>(
  {
    destinationBucket: text(),
    destinationPrefix: optional(text()),
    metadata: optional(array(validateMetadataGlob)),
    source: validateS3ObjectRef,
  },
  true,
);
