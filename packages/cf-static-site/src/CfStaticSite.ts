import * as cdk from '@aws-cdk/core';
import * as cf from '@aws-cdk/aws-cloudfront';
import * as iam from '@aws-cdk/aws-iam';
import * as route53 from '@aws-cdk/aws-route53';
import * as s3 from '@aws-cdk/aws-s3';
import { AcmAutoCert } from '@fmtk/acm-auto-cert';
import { DeletableBucket } from '@fmtk/s3-empty-bucket';
import { S3UnpackAsset } from '@fmtk/s3-unpack-asset';
import { CfStaticSiteProps } from './CfStaticSiteProps';

type ReadWrite<T> = { -readonly [P in keyof T]: T[P] };

export class CfStaticSite extends cdk.Resource {
  public readonly originBucket: s3.Bucket;
  public readonly originAccessId: cf.CfnCloudFrontOriginAccessIdentity;
  public readonly distribution: cf.CloudFrontWebDistribution;
  public readonly certificate: AcmAutoCert | undefined;

  constructor(scope: cdk.Construct, id: string, props: CfStaticSiteProps) {
    super(scope, id);

    // create a bucket to serve the website from
    this.originBucket = new DeletableBucket(this, 'StaticWWW', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
    });

    // write the build output to the origin bucket (doesn't delete old files)
    new S3UnpackAsset(this, 'DeployWebsite', {
      source: props.source,
      destinationBucket: this.originBucket.bucketName,
      metadata: props.metadata,
    });

    // create an identity for cloudfront to access the S3 bucket
    this.originAccessId = new cf.CfnCloudFrontOriginAccessIdentity(
      this,
      'OriginAccessID',
      {
        cloudFrontOriginAccessIdentityConfig: {
          comment: `OAI for website`,
        },
      },
    );

    // let cloudfront access the S3 bucket
    this.originBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject*'],
        resources: [`${this.originBucket.bucketArn}/*`],
        principals: [
          new iam.CanonicalUserPrincipal(
            this.originAccessId.attrS3CanonicalUserId,
          ),
        ],
      }),
    );

    const distProps: ReadWrite<cf.CloudFrontWebDistributionProps> = {
      enableIpV6: true,
      originConfigs: [
        {
          behaviors: [{ isDefaultBehavior: true }],
          s3OriginSource: {
            s3BucketSource: this.originBucket,
            originAccessIdentityId: this.originAccessId.ref,
          },
        },
      ],
    };

    if (props.domain) {
      if (!props.hostedZoneId) {
        throw new Error(`hostedZoneId must be specified with domain`);
      }

      this.certificate = new AcmAutoCert(this, 'FrontendCertificate', {
        domainName: props.domain,
        hostedZoneId: props.hostedZoneId,
        region: 'us-east-1',
      });

      distProps.aliasConfiguration = {
        acmCertRef: this.certificate.certificateArn,
        names: [props.domain],
      };
    }

    // create a cloudfront distribution
    this.distribution = new cf.CloudFrontWebDistribution(
      this,
      'Distribution',
      distProps,
    );

    if (props.domain) {
      // alias to point to the CloudFront distribution
      const aliasTarget: route53.CfnRecordSetGroup.AliasTargetProperty = {
        dnsName: this.distribution.domainName,
        hostedZoneId: 'Z2FDTNDATAQYW2',
      };

      // A and AAAA records for the alias
      new route53.CfnRecordSetGroup(this, 'CloudfrontDNS', {
        hostedZoneId: props.hostedZoneId,
        recordSets: [
          { name: props.domain, type: 'A', aliasTarget },
          { name: props.domain, type: 'AAAA', aliasTarget },
        ],
      });
    }
  }
}
