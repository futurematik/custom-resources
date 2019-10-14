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
  let data: string | Buffer;
  let contentType: string;

  if (!props.data) {
    data = '';
    contentType = 'application/octet-stream';
  } else if (typeof props.data === 'string') {
    data = props.data;
    contentType = 'text/plain';
  } else if (Buffer.isBuffer(props.data)) {
    data = props.data;
    contentType = 'application/octet-stream';
  } else {
    data = JSON.stringify(props.data);
    contentType = 'application/json';
  }

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
      ContentType: props.contentType || contentType,
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
