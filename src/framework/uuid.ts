import crypto from './crypto';

export function uuid4(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = (Math.random() * 16) | 0,
			v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/** UUID :
 * version 4 without arguments
 * version 5 with one string as arguments
*/
export default function uuid(
  /** optionally provide a string for uuid v5 */
  v5name?: string
) {
  if (typeof v5name === 'string') {
    /* uuid v5 : */
    let h = crypto.hash(v5name, 'sha1', 'buffer');
    h[8] = h[8] & 0x3f | 0xa0; /* variant */
    h[6] = h[6] & 0x0f | 0x50; /* version */
    return (h.toString('hex', 0, 16).match(/.{1,8}/g)||[]).join('-');
  }
  /* uuid v4 */
  return uuid4()
}

/* NONCE - if fixed variable length */
export function nonce(lengthOrMin: number = 64, maxLength?: number): string {
  let length = lengthOrMin;
  if (!!maxLength && typeof maxLength === 'number') {
    length = Math.round(Math.random()*(maxLength-lengthOrMin)+lengthOrMin);
    return crypto.randomBytes(length).toString('base64')
      .substring(0, length).replace(/[^\w]/g, '');
  }
  return crypto.randomBytes(length).toString('base64').replace(/[^\w]/g, '');
}
