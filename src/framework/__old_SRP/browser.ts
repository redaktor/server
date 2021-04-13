import { pwBase } from './pwBase';

// alternative OPAQUE, s
// https://blog.cryptographyengineering.com/2018/10/19/lets-talk-about-pake/
export class Browser extends pwBase {
	protected x = null; // salted hashed password
	protected v = null; // verifier
	protected B = null; // server public key
	protected A = null; // client public key
	private a = null; // client private key
	private u = null; // blended public keys
	private S = null; // shared secret key long form
	private K = null; // shared secret hashed form
	private M1str = null; // password proof

  constructor(
		readonly N_base10: string = Browser.rfc5054_2048.N_base10,
		readonly g_base10: string = Browser.rfc5054_2048.g_base10,
		readonly k_base16: string = Browser.rfc5054_2048.k_base16
	) {
    super(N_base10, g_base10, k_base16)
  }

  /** step1
   * Records the identity 'I' and password 'P' of the authenticating user.
   * The session is incremented to {@link State#STEP1}.
   * <p>Argument origin:
   * <ul>
   *     <li>From user: user identity 'I' and password 'P'.
   * </ul>
   * @param userID   The identity 'I' of the authenticating user, UTF-8
   *                 encoded. Must not be {@code null} or empty.
   * @param password The user password 'P', UTF-8 encoded. Must not be
   *                 {@code null}.
   * @throws IllegalStateException If the method is invoked in a state
   *                               other than {@link State#INIT}.
   */
  step1(identity: string, password: string) {
    if(!!this.state) {
      throw new Error('IllegalStateException not in state INIT');
    }
  	// console.log('step1', 'N:', this.N(), 'g:', this.g(), 'k:', Browser.toHex(this.k));
  	this.checks({identity, password}, true);
  	this.I = identity;
  	this.P = password;
  	this.state = Browser.PWSTATE.STEP1;
  }

  /** step2
   * Receives the password salt 's' and public value 'B' from the server.
   * The SRP-6a crypto parameters are also set. The session is incremented
   * to {@link State#STEP2}.
   * <p>Argument origin:
   * <ul>
   *   <li>From server: password salt 's', public value 'B'.
   *   <li>Pre-agreed: crypto parameters prime 'N',
   *   generator 'g' and hash function 'H'.
   * </ul>
   * @param s      The password salt 's' as a hex string. Must not be {@code null}.
   * @param B      The public server value 'B' as a hex string. Must not be {@code null}.
   * @param k      k is H(N,g) with padding by the server. Must not be {@code null}.
   * @return The client credentials consisting of the client public key
   *         'A' and the client evidence message 'M1'.
   * @throws IllegalStateException If the method is invoked in a state
   *                               other than {@link State#STEP1}.
   * @throws SRP6Exception         If the public server value 'B' is invalid.
   */
  step2(s: string, BB: string) {
  	this.checks({s, BB});
  	// console.log('step2', 's:', s, 'BB:', BB);
  	if (this.state !== Browser.PWSTATE.STEP1) {
  		throw new Error('IllegalStateException not in state STEP1');
  	}
  	// this is checked when passed to computeSessionKey
  	this.B = Browser.fromHex(BB);
  	let ZERO = null;
  	/* jshint ignore:start */
  	ZERO = this.BigIntZero;
  	/* jshint ignore:end */
  	if (this.B.mod(this.N()).equals(ZERO)) {
  		throw new Error(`SRP6Exception bad server public value 'B' as B == 0 (mod N)`);
  	}
  	// console.log('k:', this.k);
  	// this is checked when passed to computeSessionKey
  	const x = this.generateX(s, this.I, this.P);
  	// console.log('x:', x);
  	// blank the password as there is no reason to keep it around in memory.
  	this.P = null;
    // console.log('N:', Browser.toHex(this.N).toString(16));
  	this.a = this.randomA(this.N);
    // console.log('a:', Browser.toHex(this.a));
  	this.A = this.g().modPow(this.a, this.N());
  	this.check(this.A, 'A');
  	// console.log('A:', Browser.toHex(this.A));
  	this.u = this.computeU(this.A.toString(16), BB);
  	// console.log('u:', this.u);
  	this.S = this.computeSessionKey(x);
  	this.check(this.S, 'S');
  	// console.log('jsU:', Browser.toHex(this.u), 'jsS:', Browser.toHex(this.S));
  	const AA = Browser.toHex(this.A);
    const S = Browser.toHex(this.S);
    // console.log('cAA:', AA, 'cBB:', BB, 'cSS:', Browser.toHex(this.S));
  	this.M1str = this.H(AA+BB+S);
  	this.check(this.M1str, 'M1str');
    this.M1str = this.trimLeadingZeros(this.M1str);
  	// console.log('M1str:' + this.M1str);
  	// console.log('js ABS:' + AA+BB+Browser.toHex(this.S));
  	// console.log('js A:' + AA);
  	// console.log('js B:' + BB);
  	// console.log('js v:' + this.v);
  	// console.log('js u:' + this.u);
  	// console.log('js A:' + this.A);
  	// console.log('js b:' + this.B);
  	// console.log('js S:' + this.S);
  	// console.log('js S:' + Browser.toHex(this.S));
  	// console.log('js M1:' + this.M1str);
  	this.state = Browser.PWSTATE.STEP2;
  	return { A: AA, M1: this.M1str }
  }

  /** step3
   * Receives the server evidence message 'M1'. The session is incremented
   * to {@link State#STEP3}.
   *
   * <p>Argument origin:
   * <ul>
   *     <li>From server: evidence message 'M2'.
   * </ul>
   * @param M2 The server evidence message 'M2' as string. Must not be {@code null}.
   * @throws IllegalStateException If the method is invoked in a state
   *                               other than {@link State#STEP2}.
   * @throws SRP6Exception         If the session has timed out or the
   *                               server evidence message 'M2' is
   *                               invalid.
   */
  protected step3(M2: string) {
  	this.check(M2, 'M2');
  	// Check current state
  	if (this.state !== Browser.PWSTATE.STEP2) {
  		throw new Error('IllegalStateException: Session must be in STEP2 state');
  	}
  	// console.log('step3', 'js A:', Browser.toHex(this.A), 'jsM1:', this.M1str);
  	// console.log('js S:' + Browser.toHex(this.S));
  	let computedM2 = this.H(Browser.toHex(this.A)+this.M1str+Browser.toHex(this.S));
  	// console.log('jsServerM2:' + M2); console.log('jsClientM2:' + computedM2);
    computedM2 = this.trimLeadingZeros(computedM2);
  	// console.log('server  M2:'+M2+'\ncomputedM2:'+computedM2);
  	if (`${computedM2}` !== `${M2}`) {
  		throw new Error('SRP6Exception Bad server credentials');
  	}
  	this.state = Browser.PWSTATE.STEP3;
  	return true;
  }

  /* CLIENTSIDE FUNCTIONS */

  getSessionKey(hash: any) {
  	if (this.S === null) { return null }
  	const hexedS = Browser.toHex(this.S);
  	if (hash === false) { return hexedS; }
		if (this.K === null) {
			this.K = this.H(hexedS);
		}
		return this.K;
  }

  /*
   * Generates a new salt 's'. This takes the current time, a pure browser random value,
   * and an optional server generated random, and hashes them all together.
   * This should ensure that the salt is unique to every use registration regardless
   * of the quality of the browser random generation routine.
   * Note that this method is optional as you can choose to always generate the salt at
   * the server and sent it to the browser as it is a public value.
   * <p>
   * Always add a unique constraint to where you store this in your database to force
   * that all users on the system have a unique salt.
   *
   * @param opionalServerSalt An optional server salt which is hashed into a locally
   * generated random number. Can be left undefined when calling this function.
   * @return 's' Salt as hex-string of length driven by the bit size of hash-algorithm 'H'.
   */
  generateRandomSalt(optionalServerSalt: string = 's') {
  	return this.H(`${new Date()}:${optionalServerSalt}:${Browser.randomByteHex()}`)
  }

  /*
   * Generates a new verifier 'v' from the specified parameters.
   * <p>The verifier is computed as v = g^x (mod N).
   * <p> Specification RFC 2945
   *
   * @param salt     The salt 's'. Must not be null or empty.
   * @param identity The user identity/email 'I'. Must not be null or empty.
   * @param password The user password 'P'. Must not be null or empty
   * @return The resulting verifier 'v' as a hex string
   */
  generateVerifier(salt: string, identity: string, password: string) {
  	// no need to check the parameters as generateX will do this
  	const x = this.generateX(salt, identity, password);
  	// console.log('generateVerifier, js x: ', Browser.toHex(x));
  	this.v = this.g().modPow(x, this.N());
  	// console.log('generateVerifier, js v: '+Browser.toHex(this.v));
  	return Browser.toHex(this.v);
  }


  // Privates
  private check(v: any, name: string) {
    if( typeof v === 'undefined' || v === null || v === "" || v === "0" ) {
      throw new Error(`${name} must not be null, empty or zero`);
    }
  }
  private checks(o: any, areStrings = false) {
    for (let name in o) {
      this.check(o[name], name);
      if (areStrings && typeof o[name] !== 'string') {
        throw new Error(`${name} must be a String`)
      }
    }
  }

	/** private<p>
	 *
	 * Computes x = H(s | H(I | ':' | P))
	 * <p> Uses string concatenation before hashing.
	 * <p> Specification RFC 2945
	 *
	 * @param salt     The salt 's'. Must not be null or empty.
	 * @param identity The user identity/email 'I'. Must not be null or empty.
	 * @param password The user password 'P'. Must not be null or empty
	 * @return The resulting 'x' value as BigInteger.
	 */
	private generateX(salt: string, identity: string, password: string) {
    this.checks({salt, identity, password}, true);
    // console.log('js salt:', salt, 'js i:', identity, 'js p:', password);
		this.salt = salt;
		const _h = this.trimLeadingZeros(this.H(`${identity}:${password}`));
		// console.log('js salt:', salt, 'js _h:', _h);
		const hash = this.trimLeadingZeros(this.H(`${salt}${_h}`.toUpperCase()));
		this.x = Browser.fromHex(hash).mod(this.N());
		return this.x;
	}

	/**
	 * Computes the session key S = (B - k * g^x) ^ (a + u * x) (mod N)
	 * from client-side parameters.
	 *
	 * <p>Specification: RFC 5054
	 *
	 * @param N The prime parameter 'N'. Must not be {@code null}.
	 * @param g The generator parameter 'g'. Must not be {@code null}.
	 * @param k The SRP-6a multiplier 'k'. Must not be {@code null}.
	 * @param x The 'x' value, see {@link #computeX}. Must not be
	 *          {@code null}.
	 * @param u The random scrambling parameter 'u'. Must not be
	 *          {@code null}.
	 * @param a The private client value 'a'. Must not be {@code null}.
	 * @param B The public server value 'B'. Must note be {@code null}.
	 *
	 * @return The resulting session key 'S'.
	 */
	private computeSessionKey(x: any, k = this.k, u = this.u, a = this.a, B = this.B) {
		this.checks({k, x, u, a, B});
		var exp = u.multiply(x).add(a);
		var tmp = this.g().modPow(x, this.N()).multiply(k);
		return B.subtract(tmp).modPow(exp, this.N());
	}

  /**
  * Generate a random value in the range `[1,N)` using a minimum of 256 random bits.
  *
  * See specification RFC 5054.
  * This method users the best random numbers available. Just in case the random number
  * generate in the client web browser is totally buggy it also adds `H(I+':'+salt+':'+time())`
  * to the generated random number.
  * @param N The safe prime.
  */
  private randomA(N: any) {
    // console.log('N:'+N);
    // our ideal number of random  bits to use for `a` as long as its bigger than 256 bits
    var hexLength = Browser.toHex(N).length;
    var ZERO = Browser.BigInteger('0', 10);
    var ONE = Browser.BigInteger('1', 10);
    var r = ZERO;
    //  loop until we don't have a ZERO value. we would have to generate exactly N to loop so very rare.
    while(ZERO.equals(r)){
      // in theory we get 256 bits of good random numbers here
      var rstr = `${Browser.randomByteHex()}${Browser.randomByteHex()}`;
      // add more random bytes until we are at least as large as N and ignore any overshoot
      while( rstr.length < hexLength ) {
          rstr = `${rstr}${Browser.randomByteHex()}`;
      }
      // console.log('rstr:'+rstr);
      // we now have a random just at lest 256 bits but typically more bits than N for large N
      var rBi = Browser.BigInteger(rstr, 16);
      // console.log('rBi:'+rBi);
      // this hashes the time in ms such that we wont get repeated numbers for successive attempts
      // it also hashes the salt which can itself be salted by a server strong random which protects
      // against rainbow tables. it also hashes the user identity which is unique to each user
      // to protect against having simply no good random numbers anywhere
      var oneTimeBi = Browser.BigInteger(this.H(this.I+':'+this.salt+':'+(new Date()).getTime()), 16);

      // console.log('oneTimeBi:'+oneTimeBi);
      // here we add the 'one time' hashed time number to our random number to the random number
      // this protected against a buggy browser random number generated generating a constant value
      // we mod(N) to wrap to the range [0,N) then loop if we get 0 to give [1,N)
      // mod(N) is broken due to buggy library code so we workaround with modPow(1,N)
      r = (oneTimeBi.add(rBi)).modPow(ONE, N);
    }
    // console.log('r:'+r);
    // the result will in the range [1,N) using more random bits than size N
    return r;
  }

  /**
   * Computes the random scrambling parameter u = H(A | B)
   * <p> Specification RFC 2945
   * Will throw an error if
   *
   * @param A      The public client value 'A'. Must not be {@code null}.
   * @param B      The public server value 'B'. Must not be {@code null}.
   *
   * @return The resulting 'u' value.
   */
  private computeU(Astr: string, Bstr: string) {
  	// console.log('computeU');
  	this.checks({Astr, Bstr}, true);
  	/* jshint ignore:start */
  	var output = this.H(Astr+Bstr);
  	// console.log('js raw u:'+output);
  	var u = Browser.BigInteger(output, 16);
  	// console.log('js u:'+Browser.toHex(u));
  	if( this.BigIntZero.equals(u) ) {
  	   throw new Error(`SRP6Exception bad shared public value 'u' as u==0`);
  	}
  	return u;
  	/* jshint ignore:end */
  }

}
