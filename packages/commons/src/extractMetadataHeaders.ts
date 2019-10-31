import { Metadata } from './Metadata';

const headerMap = {
  CacheControl: 'cache-control',
  ContentDisposition: 'content-disposition',
  ContentEncoding: 'content-encoding',
  ContentLanguage: 'content-language',
  ContentType: 'content-type',
};

// eslint-disable-next-line
export interface Headers extends Partial<typeof headerMap> {}

export interface MetadataWithHeaders {
  headers: Headers;
  metadata: Metadata;
}

export function extractMetadataHeaders(
  metadata: Metadata,
): MetadataWithHeaders {
  const ret: MetadataWithHeaders = { headers: {}, metadata: {} };

  for (const key in metadata) {
    const header = getHeaderName(key);
    if (header) {
      ret.headers[header] = metadata[key];
    } else {
      ret.metadata[key] = metadata[key];
    }
  }

  return ret;
}

function getHeaderName(key: string): keyof Headers | undefined {
  for (const header in headerMap) {
    if (key.toLowerCase() === headerMap[header as keyof Headers]) {
      return header as keyof Headers;
    }
  }
}
