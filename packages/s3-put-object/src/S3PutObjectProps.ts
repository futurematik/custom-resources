import { properties, text, any, optional } from '@fmtk/validation';

export interface S3PutObjectProps {
  bucket: string;
  objectName: string;
  data: unknown;
  contentType?: string;
}

export const validateS3PutObjectProps = properties<S3PutObjectProps>(
  {
    bucket: text(),
    objectName: text(),
    data: any(),
    contentType: optional(text()),
  },
  true,
);
