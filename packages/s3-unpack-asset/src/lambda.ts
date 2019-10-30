import fs from 'fs';
import path from 'path';
import {
  createCustomResourceHandler,
  CustomResourceResponse,
} from '@fmtk/aws-custom-resource';
import { rootValidator, ValidationMode } from '@fmtk/validation';
import { S3 } from 'aws-sdk';
import {
  S3UnpackAssetProps,
  validateS3UnpackAssetProps,
} from './S3UnpackAssetProps';
import { readZip } from '@fmtk/util-zip';
import { lookup as mime } from 'mime-types';

export const handler = createCustomResourceHandler(
  {
    create(
      params: S3UnpackAssetProps,
      event,
      context,
      autoId,
    ): Promise<CustomResourceResponse> {
      return unpack(params, autoId);
    },

    update(params: S3UnpackAssetProps, event): Promise<CustomResourceResponse> {
      return unpack(params, event.PhysicalResourceId);
    },
  },
  {
    propertyValidator: rootValidator(validateS3UnpackAssetProps, {
      mode: ValidationMode.String,
    }),
  },
);

async function unpack(
  props: S3UnpackAssetProps,
  physicalResourceId: string,
): Promise<CustomResourceResponse> {
  const s3 = new S3();

  const filePath = '/tmp/source.zip';
  const file = fs.createWriteStream(filePath);

  const objStream = s3
    .getObject({
      Bucket: props.source.bucket,
      Key: props.source.key,
    })
    .createReadStream();

  const done = new Promise(resolve => objStream.once('end', resolve));
  objStream.pipe(file);
  await done;

  const zip = readZip(filePath);

  for await (const entry of zip) {
    const destPath = path.join(props.destinationPrefix || '', entry.path);

    await s3
      .upload({
        Body: await entry.open(),
        Bucket: props.destinationBucket,
        Key: destPath,
        ContentType: mime(entry.path) || 'application/octet-stream',
      })
      .promise();
  }

  return {
    responseStatus: 'SUCCESS',
    physicalResourceId,
  };
}
