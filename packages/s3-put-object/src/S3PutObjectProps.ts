import { properties, text, any } from '@fmtk/validation';

export interface S3PutObjectProps {
  bucket: string;
  objectName: string;
  data: unknown;
}

export const validateS3PutObjectProps = properties<S3PutObjectProps>(
  {
    bucket: text(),
    objectName: text(),
    data: any(),
  },
  true,
);
