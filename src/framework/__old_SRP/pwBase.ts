import { md, random, util } from 'node-forge';
import { BigInteger } from 'jsbn';

// RFC 5054 2048bit constants
export const rfc5054_2048 = {
N_base10: `217661744586174357731910088918027537819076683742555385111446432246898
86235383840957210909013086056401571399717235807266581649606472148410291413364152
19736447718088739565548373811507267740223510176252190156982074029314952962041933
32662620734710545483687360395197024862265062488610602569718029849535611214426801
57668000761429988222457090413873973970171927093992114751765168063614761119615476
23342209644278311797123637164733387141433589577347466730896705080700550932042479
96784170368679283167612722742303140675482911335824795830614395775593471019617714
06173684378522703483495337037655006751328447510550299250924469288819`,
g_base10: `2`,
k_base16: `5b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300`
}

enum PWSTATE { STEP1, STEP2, STEP3 }
export class pwBase {
	protected I: string = null; 	// identity (user name)
	protected P: string = null; 	// password, nulled after use
	protected salt: string = null;// salt

	protected readonly BigIntZero = BigInteger.ZERO;
  private _state: 0 | PWSTATE = 0;

  constructor(
		readonly N_base10: string = rfc5054_2048.N_base10,
		readonly g_base10: string = rfc5054_2048.g_base10,
		readonly k_base16: string = rfc5054_2048.k_base16
	) {

  }

	// public getter of the current workflow state.
	get state() {
		return this._state;
	}
	set state(s: PWSTATE) {
		this._state = s;
	}
	get UserID() {
		"use strict";
		return this.I;
	}
	static PWSTATE = PWSTATE;
	static rfc5054_2048 = rfc5054_2048;

	protected N() {
		return new BigInteger(this.N_base10, 10);
	}
	protected g() {
		return new BigInteger(this.g_base10, 10);
	}
	protected k = new BigInteger(this.k_base16, 16);

	protected H(x: any) {
		var md = md.sha256.create();
		md.update(`${x}`);
		return md.digest().toString().toLowerCase();
	}
	protected trimLeadingZeros(s: string) {
    // server BigInteger math will trim leading zeros so we must do likewise to get a match
  	while (s.substring(0, 1) === '0') { s = s.substring(1) }
    return s
  }

	// public helpers
	static randomByteHex(hexLength = 16) {
	  let bytesSync = random.getBytesSync(hexLength);
	  const rndHex = util.binary.hex.encode(bytesSync);
	  //console.log('bytesSync', rndHex);
	  return rndHex
	}
	static toHex(n) {
		"use strict";
		return n.toString(16);
	}
	static fromHex(s) {
		"use strict";
		return new BigInteger(`${s}`, 16);
	}
	// public helper to hide BigInteger from the linter
	/* jshint ignore:start */
	static BigInteger(string, radix) {
		"use strict";
		return new BigInteger(""+string, radix); // jdk1.7 rhino requires string concat
	}
	/* jshint ignore:end */




}
