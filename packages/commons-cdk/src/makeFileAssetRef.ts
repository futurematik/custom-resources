import * as cdk from '@aws-cdk/core';
import { FileAssetOptions, makeFileAsset } from './makeFileAsset';
import { S3ObjectRef, assetRef } from '@fmtk/custom-resources-commons';

export function makeFileAssetRef(
  scope: cdk.Construct,
  path: string,
  opts: FileAssetOptions = {},
): S3ObjectRef {
  return assetRef(makeFileAsset(scope, path, opts));
}
