import { properties, text, optional, array } from '@fmtk/validation';

export interface AcmAutoCertProps {
  domainName: string;
  hostedZoneId: string;
  region?: string;
  subjectAlternativeNames?: string[];
}

export const validateAcmAutoCertProps = properties<AcmAutoCertProps>({
  domainName: text(),
  hostedZoneId: text(),
  region: optional(text()),
  subjectAlternativeNames: optional(array(text())),
});
