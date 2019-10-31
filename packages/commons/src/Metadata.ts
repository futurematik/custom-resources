import { dictionary, text } from '@fmtk/validation';

export interface Metadata {
  [key: string]: string;
}

export const validateMetadata = dictionary(text());
