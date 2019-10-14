import { properties, text, optional, bool } from '@fmtk/validation';

export interface S3EmptyBucketProps {
  bucket: string;
  emptyOnCreate?: boolean;
  emptyOnDelete?: boolean;
  emptyOnUpdate?: boolean;
  prefix?: string;
}

export const validateS3EmptyBucketProps = properties<S3EmptyBucketProps>({
  bucket: text(),
  emptyOnCreate: optional(bool()),
  emptyOnDelete: optional(bool()),
  emptyOnUpdate: optional(bool()),
  prefix: optional(text()),
});
