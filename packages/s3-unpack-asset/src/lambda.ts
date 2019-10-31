import fs from 'fs';
import path from 'path';
import {
  createCustomResourceHandler,
  CustomResourceResponse,
} from '@fmtk/aws-custom-resource';
import { S3 } from 'aws-sdk';
import {
  S3UnpackAssetProps,
  validateS3UnpackAssetProps,
  MetadataGlob,
} from './S3UnpackAssetProps';
import { readZip } from '@fmtk/util-zip';
import { lookup as mime } from 'mime-types';
import minimatch from 'minimatch';
import {
  handlerValidator,
  extractMetadataHeaders,
  MetadataWithHeaders,
} from '@fmtk/custom-resources-commons';

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
    propertyValidator: handlerValidator(validateS3UnpackAssetProps),
  },
);

async function unpack(
  props: S3UnpackAssetProps,
  physicalResourceId: string,
): Promise<CustomResourceResponse> {
  const s3 = new S3();
  const metadata = processMetdata(props.metadata);

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
    const entryMeta = findMetadata(metadata, entry.path);
    const destPath = path.join(props.destinationPrefix || '', entry.path);

    await s3
      .upload({
        Body: await entry.open(),
        Bucket: props.destinationBucket,
        Key: destPath,
        ...entryMeta.headers,
        Metadata: entryMeta.metadata,
        ContentType:
          entryMeta.headers.ContentType ||
          mime(entry.path) ||
          'application/octet-stream',
      })
      .promise();
  }

  return {
    responseStatus: 'SUCCESS',
    physicalResourceId,
  };
}

interface ProcessedMetadataGlob {
  glob: string;
  metadata: MetadataWithHeaders;
}

function processMetdata(
  metadata: MetadataGlob[] | undefined,
): ProcessedMetadataGlob[] {
  return metadata
    ? metadata.map(x => ({
        glob: x.glob,
        metadata: extractMetadataHeaders(x.metadata),
      }))
    : [];
}

function findMetadata(
  metadata: ProcessedMetadataGlob[],
  path: string,
): MetadataWithHeaders {
  for (const item of metadata) {
    if (minimatch(path, item.glob)) {
      return item.metadata;
    }
  }
  return { headers: {}, metadata: {} };
}
