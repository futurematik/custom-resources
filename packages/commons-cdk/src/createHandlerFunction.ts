import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { logRetentionDays } from './logRetentionDays';

export interface HandlerOptions {
  code: lambda.Code;
  handler?: string;
  logRetentionDays?: number;
  runtime?: lambda.Runtime;
  timeout?: cdk.Duration;
  uuid?: string;
}

export function createHandlerFunction<T>(
  scope: cdk.Construct,
  name: string,
  opts: HandlerOptions,
): lambda.SingletonFunction {
  return new lambda.SingletonFunction(scope, `${name}Handler`, {
    code: opts.code,
    handler: opts.handler || 'lambda.handler',
    logRetention: logRetentionDays(opts.logRetentionDays || 7),
    runtime: opts.runtime || lambda.Runtime.NODEJS_10_X,
    timeout: opts.timeout || cdk.Duration.minutes(15),
    uuid: opts.uuid || `CustomResourceHandler${name}`,
  });
}
