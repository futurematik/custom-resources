import {
  ValueValidator,
  RootValidator,
  rootValidator,
  ValidationMode,
  ValidationResult,
} from '@fmtk/validation';

export function handlerValidator<T>(
  validator: ValueValidator<T>,
): RootValidator<T> {
  return rootValidator(
    (ctx): ValidationResult<T> => {
      let value = ctx.value as any;

      if (ctx.value && typeof ctx.value === 'object') {
        value = { ...ctx.value };
        delete value['ServiceToken'];
      }

      return validator({ ...ctx, value });
    },
    { mode: ValidationMode.String },
  );
}
