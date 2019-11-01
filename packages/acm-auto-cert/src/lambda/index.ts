import { createCustomResourceHandler } from '@fmtk/aws-custom-resource';
import { validateAcmAutoCertProps } from '../AcmAutoCertProps';
import { handlerValidator } from '@fmtk/custom-resources-commons';
import { createUpdateResource } from './createUpdateResource';
import { deleteResource } from './deleteResource';

export const handler = createCustomResourceHandler(
  {
    create: createUpdateResource,
    update: createUpdateResource,
    delete: deleteResource,
  },
  {
    propertyValidator: handlerValidator(validateAcmAutoCertProps),
  },
);
