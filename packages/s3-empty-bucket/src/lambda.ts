import {
  createCustomResourceHandler,
  CustomResourceResponse,
} from '@fmtk/aws-custom-resource';
import { handlerValidator } from '@fmtk/custom-resources-commons';
import { S3 } from 'aws-sdk';
import {
  S3EmptyBucketProps,
  validateS3EmptyBucketProps,
} from './S3EmptyBucketProps';

export const handler = createCustomResourceHandler<S3EmptyBucketProps>(
  {
    async create(
      params,
      event,
      context,
      autoId,
    ): Promise<CustomResourceResponse> {
      if (params.emptyOnCreate) {
        await empty(params.bucket, params.prefix);
      }
      return {
        responseStatus: 'SUCCESS',
        physicalResourceId: autoId,
      };
    },

    async update(params, event): Promise<CustomResourceResponse> {
      if (params.emptyOnUpdate) {
        await empty(params.bucket, params.prefix);
      }
      return {
        responseStatus: 'SUCCESS',
        physicalResourceId: event.PhysicalResourceId,
      };
    },

    async delete(params, event): Promise<CustomResourceResponse> {
      if (params.emptyOnDelete) {
        await empty(params.bucket, params.prefix);
      }
      return {
        responseStatus: 'SUCCESS',
        physicalResourceId: event.PhysicalResourceId,
      };
    },
  },
  {
    propertyValidator: handlerValidator(validateS3EmptyBucketProps),
  },
);

async function empty(bucket: string, prefix?: string): Promise<void> {
  const s3 = new S3();
  console.log(`empyting bucket ${bucket} (prefix='${prefix || ''}')`);

  for (;;) {
    const objects = await s3
      .listObjectsV2({ Bucket: bucket, Prefix: prefix })
      .promise();

    if (!objects.Contents || !objects.Contents.length) {
      console.log(`nothing more to delete`);
      break;
    }

    const ids = objects.Contents.reduce(
      (a, { Key }) => (Key ? [...a, { Key }] : a),
      [] as S3.ObjectIdentifier[],
    );

    console.log(`deleting ids`, ids);

    await s3
      .deleteObjects({
        Bucket: bucket,
        Delete: {
          Objects: objects.Contents.reduce(
            (a, { Key }) => (Key ? [...a, { Key }] : a),
            [] as S3.ObjectIdentifier[],
          ),
        },
      })
      .promise();
  }
}
