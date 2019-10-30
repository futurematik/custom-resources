import {
  createCustomResourceHandler,
  CustomResourceResponse,
} from '@fmtk/aws-custom-resource';
import { rootValidator, ValidationMode } from '@fmtk/validation';
import { S3 } from 'aws-sdk';
import { S3PutObjectProps, validateS3PutObjectProps } from './S3PutObjectProps';
import { lookup as mime } from 'mime-types';
import { hash } from '@fmtk/custom-resources-commons';

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

  const s3 = new S3();

  if (props.source) {
    const objStream = s3
      .getObject({
        Bucket: props.source.bucket,
        Key: props.source.key,
      })
      .createReadStream();

    const chunks: Buffer[] = [];

    for await (const chunk of objStream) {
      chunks.push(chunk);
    }

    data = Buffer.concat(chunks);
    contentType =
      props.contentType || mime(props.source.key) || 'application/octet-stream';
  } else {
    if (!props.contents) {
      data = '';
      contentType = 'application/octet-stream';
    } else if (typeof props.contents === 'string') {
      data = props.contents;
      contentType = 'text/plain';
    } else if (Buffer.isBuffer(props.contents)) {
      data = props.contents;
      contentType = 'application/octet-stream';
    } else {
      data = JSON.stringify(props.contents);
      contentType = 'application/json';
    }

    contentType = props.contentType || contentType;
  }

  if (props.replacements) {
    let dataStr = data.toString();

    for (const r of props.replacements) {
      const search = new RegExp(
        r.regex ? r.search : escapeRegExp(r.search),
        'g',
      );
      dataStr = dataStr.replace(search, r.replace);
    }

    data = dataStr;
  }

  await s3
    .putObject({
      Body: data,
      Bucket: props.target.bucket,
      Key: props.target.key,
      ContentType: contentType,
    })
    .promise();

  return {
    responseStatus: 'SUCCESS',
    physicalResourceId: hash([
      props.target.bucket,
      props.target.key,
      contentType,
      data,
    ]),
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}
