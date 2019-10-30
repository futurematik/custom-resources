import * as cdk from '@aws-cdk/core';
import * as s3assets from '@aws-cdk/aws-s3-assets';

export enum FileAssetType {
  File,
  Directory,
}

export interface FileAssetOptions extends s3assets.AssetOptions {
  readonly requireType?: FileAssetType;
}

export function makeFileAsset(
  scope: cdk.Construct,
  path: string,
  opts: FileAssetOptions = {},
): s3assets.Asset {
  // figure out a unique id for the asset
  let id = 1;
  while (scope.node.tryFindChild(`Asset${id}`)) {
    id++;
  }

  const asset = new s3assets.Asset(scope, `Asset${id}`, { path });

  switch (opts.requireType) {
    case FileAssetType.Directory:
      if (!asset.isZipArchive) {
        throw new Error(`Asset path must be either a .zip file or a directory`);
      }
      break;

    case FileAssetType.File:
      if (asset.isZipArchive) {
        throw new Error(`Asset path must be a file`);
      }
      break;
  }

  return asset;
}
