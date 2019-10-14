import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { CustomResourceProps } from './CustomResourceProps';
import { createHandlerFunction } from './createHandlerFunction';

export class CustomResource<T> extends cdk.Resource {
  public readonly resource: cdk.CfnResource;
  protected readonly handler: lambda.SingletonFunction;

  constructor(
    scope: cdk.Construct,
    id: string,
    { name, props, handler }: CustomResourceProps<T>,
  ) {
    super(scope, id);

    this.handler = createHandlerFunction(this, name, handler);

    this.resource = new cdk.CfnResource(this, 'Resource', {
      type: `Custom::${name}`,
      properties: {
        ServiceToken: this.handler.functionArn,
        ...props,
      },
    });
  }
}
