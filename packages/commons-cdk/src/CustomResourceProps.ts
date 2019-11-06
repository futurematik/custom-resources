import { HandlerOptions } from './createHandlerFunction';

export interface CustomResourceProps<T> {
  handler: HandlerOptions;
  name: string;
  props: T;
}
