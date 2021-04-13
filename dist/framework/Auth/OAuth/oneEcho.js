"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const one_1 = require("./one");
const util_1 = require("@dojo/framework/core/util");
class OAuthEcho extends one_1.default {
    constructor(realm, verify_credentials, ...args) {
        super(util_1.mixin({
            consumerKey: realm,
            consumerSecret: verify_credentials
        }, args));
        this.realm = realm;
        this.verify_credentials = verify_credentials;
        this._type = 'Echo';
        this._authKey = 'X-Verify-Credentials-Authorization';
    }
    get _headerPrefix() {
        return ['OAuth realm="', this.realm, '",'].join('');
    }
    _getOAuthParams(kwArgs) {
        var oauthParams = this.OAuthParams;
        if (kwArgs.oauth_token) {
            oauthParams['oauth_token'] = kwArgs.oauth_token;
        }
        util_1.mixin(kwArgs, {
            method: 'GET',
            url: this['verify_credentials']
        });
        oauthParams.oauth_signature = this._getSignature(kwArgs, oauthParams);
        return this._sortParams(oauthParams);
    }
}
exports.OAuthEcho = OAuthEcho;
exports.default = OAuthEcho;
//# sourceMappingURL=oneEcho.js.map