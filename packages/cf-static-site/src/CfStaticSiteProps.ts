import { S3ObjectRef } from '@fmtk/custom-resources-commons';
import { MetadataGlob } from '@fmtk/s3-unpack-asset';

export interface CfStaticSiteProps {
  domain?: string;
  hostedZoneId?: string;
  indexDocument?: string;
  metadata?: MetadataGlob[];
  source: S3ObjectRef;
  spa?: boolean;
}
