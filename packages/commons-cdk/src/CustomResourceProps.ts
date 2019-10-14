import { HandlerOptions } from './createHandlerFunction';

export interface CustomResourceProps<T> {
  name: string;
  props: T;
  handler: HandlerOptions;
}
