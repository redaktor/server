import { BigInteger } from 'jsbn';

export class PakeBase {
	static ZERO = PakeBase.BigInteger('0', 10);
	static ONE = PakeBase.BigInteger('1', 10);

	protected I: string = null; // identity (user name)
	protected P: string = null; // password, nulled after use
	protected s: string | BigInteger = null; // salt
  protected _state = 0;

  constructor() { }
	// public getter of the current workflow state.
	get state() { return this._state }
	set state(s) { this._state = s }
	get UserID() { return this.I }

	protected check(v: any, name: string, isString = false) {
    if( typeof v === 'undefined' || v === null || v === "" || v === "0" ) {
      throw new Error(`${name} must not be null, empty or zero`);
    }
		if (isString && typeof v !== 'string') {
			throw new Error(`${name} must be a String`)
		}
  }
  protected checks(o: any, areStrings = false) {
    for (let name in o) {
      this.check(o[name], name, areStrings);
    }
		return true
  }
	// TODO TS
	protected put(o: any) {
		for (let k in o) {
			if (this.hasOwnProperty(k) || k === 'state') { this[k] = o[k] }
		}
		return o
	}

	// public helpers
	static trimLeadingZeros(s: string) {
    // server BigInteger math will trim leading zeros so we must do likewise to get a match
  	while (s.substring(0, 1) === '0') { s = s.substring(1) }
    return s
  }
	static randomBytes(byteLength = 16): any {
		return window.crypto.getRandomValues(new Uint8Array(byteLength));
	}
	static randomByteHex(hexLength = 16) {
		// window.crypto overwritten in nodeJS
		if (!window.crypto || typeof window.crypto.getRandomValues !== 'function') {
			// TODO browser fallback ?
			throw new Error(`Your browser does not support window.crypto`);
		}
		const bytesSync = window.crypto.getRandomValues(new Uint8Array(hexLength));
		return Array.prototype.map.call(bytesSync, function(byte: number) {
	    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
	  }).join('');
	}
	static toHex(n: BigInteger | number) {
		"use strict";
		return n.toString(16);
	}
	static fromHex(s: string) {
		"use strict";
		return new BigInteger(`${s}`, 16);
	}

	static BigInteger(s: string, radix: number) {
		"use strict";
		return new BigInteger(`${s}`, radix);
	}

}
