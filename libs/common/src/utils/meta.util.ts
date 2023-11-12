import { toJSON } from './transform.util';
import { Metadata } from '../interfaces';

export type MetaKey =
  | 'user-agent'
  | 'x-at'
  | 'x-by'
  | 'x-in'
  | 'x-zone'
  | 'x-token'
  | 'x-user-ip'
  | 'x-api-key'
  | 'x-api-token'
  | 'x-request-id'
  | 'x-user-agent'
  | 'x-authorization'
  | 'x-mongo-session'
  | 'x-naming-convention';

export const get = <T = any>(meta: Metadata, key: MetaKey): T =>
  key.startsWith('x-')
    ? toJSON(meta[key] || meta[key.replace(/^x-/, '')])
    : toJSON(meta[key] || meta['x-' + key]);

export const set = (meta: Metadata, key: MetaKey, val: any): string =>
  key.startsWith('x-')
    ? (meta[key] = typeof val === 'string' ? val : JSON.stringify(val))
    : (meta['x-' + key] = typeof val === 'string' ? val : JSON.stringify(val));
