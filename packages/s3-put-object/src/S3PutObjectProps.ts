import {
  text,
  any,
  optional,
  properties,
  and,
  ValidationResult,
  objectHasProps,
  invalidResult,
  validResult,
  bool,
  array,
} from '@fmtk/validation';
import {
  S3ObjectRef,
  validateS3ObjectRef,
} from '@fmtk/custom-resources-commons';

export interface TextReplacement {
  regex?: boolean;
  replace: string;
  search: string;
}

export interface S3PutObjectProps {
  target: S3ObjectRef;
  contents?: unknown;
  contentType?: string;
  replacements?: TextReplacement[];
  source?: S3ObjectRef;
}

export const validateTextReplacement = properties<TextReplacement>({
  regex: optional(bool()),
  replace: text(),
  search: text(),
});

export const validateS3PutObjectProps = and(
  properties<S3PutObjectProps>({
    target: validateS3ObjectRef,
    contents: optional(any()),
    contentType: optional(text()),
    replacements: optional(array(validateTextReplacement)),
    source: optional(validateS3ObjectRef),
  }),
  ({ field, value }): ValidationResult<S3PutObjectProps> => {
    if (
      objectHasProps(value, 'contents', 'source') &&
      value.contents &&
      value.source
    ) {
      return invalidResult(
        'EITHER_CONTENTS',
        'specify either contents or source, not both',
        field,
        'contents',
        'source',
      );
    }
    return validResult(value as S3PutObjectProps);
  },
);
