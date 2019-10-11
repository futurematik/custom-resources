import { createHash } from 'crypto';
import {
  createCustomResourceHandler,
  CustomResourceResponse,
} from '@fmtk/aws-custom-resource';
import { rootValidator, ValidationMode } from '@fmtk/validation';
import { S3 } from 'aws-sdk';
import { S3PutObjectProps, validateS3PutObjectProps } from './S3PutObjectProps';

export const handler = createCustomResourceHandler(
  {
    create: put,
    update: put,
  },
  {
    propertyValidator: rootValidator(validateS3PutObjectProps, {
      mode: ValidationMode.String,
    }),
  },
);

async function put(props: S3PutObjectProps): Promise<CustomResourceResponse> {
  let data: string;

  if (props.data && typeof props.data === 'object') {
    data = JSON.stringify(props.data);
  } else {
    data = props.data as string;
  }

  const s3 = new S3();

  await s3
    .putObject({
      Body: data,
      Bucket: props.bucket,
      Key: props.objectName,
    })
    .promise();

  const hash = createHash('sha1');
  hash.update(props.bucket);
  hash.update(props.objectName);
  hash.update(data);

  return {
    responseStatus: 'SUCCESS',
    physicalResourceId: hash.digest('hex'),
  };
}
