"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@dojo/framework/core/util");
const config_1 = require("../IndieAuth/config");
const one_1 = require("../OAuth/one");
const two_1 = require("../OAuth/two");
const MailAuth_1 = require("../MailAuth");
const GPGAuth_1 = require("../GPGAuth");
const authDefinitions = {
    "id": "https://indieauth.com/IndieAuth",
    "title": "IndieAuth",
    "definitions": {
        "debug": {
            "description": "Explain errors in the console?",
            "type": "boolean",
            "default": false
        },
        "requestUrl": {
            "description": "Get Request Token.",
            "type": "string",
            "format": "url"
        },
        "authUrl": {
            "description": "Obtain User Authorization.",
            "type": "string",
            "format": "url"
        },
        "accessUrl": {
            "description": "Exchange Details for Access Token.",
            "type": "string",
            "format": "url"
        },
        "callbackUrl": {
            "description": "Redirect User to Consumer (us).",
            "type": "string",
            "format": "url"
        },
        "consumerKey": {
            "description": "OAuth 1 API credentials: key",
            "type": "string"
        },
        "consumerSecret": {
            "description": "OAuth 1 API credentials: secret",
            "type": "string"
        },
        "clientId": {
            "description": "OAuth 2 API credentials: key",
            "type": "string"
        },
        "clientSecret": {
            "description": "OAuth 2 API credentials: secret",
            "type": "string"
        },
        "user": {
            "description": "Basic and Mail API credentials: key",
            "type": "string"
        },
        "pass": {
            "description": "Basic and Mail API credentials: secret",
            "type": "string"
        },
        "apiKey": {
            "description": "An additional API key to identify you",
            "type": "string"
        },
        "domain": {
            "description": "An additional domain to identify you",
            "type": "string"
        },
        "email": {
            "description": "Sender eMail Address",
            "type": "string"
        },
        "displayEmail": {
            "description": "Sender Title",
            "type": "string"
        },
        "host": {
            "description": "SMTP host",
            "type": "string"
        },
        "port": {
            "description": "SMTP port",
            "type": "string",
            "default": 587
        },
        "OAuth": {
            "definitions": {
                "basics": {
                    "type": "object",
                    "properties": {
                        "debug": { "$ref": "#definitions/debug" },
                        "authUrl": { "$ref": "#definitions/authUrl" },
                        "accessUrl": { "$ref": "#definitions/accessUrl" },
                        "callbackUrl": { "$ref": "#definitions/callbackUrl" }
                    }
                },
                "OAuth1": {
                    "type": "object",
                    "properties": {
                        "consumerKey": { "$ref": "#definitions/consumerKey" },
                        "consumerSecret": { "$ref": "#definitions/consumerSecret" }
                    }
                },
                "OAuth1_3legged": {
                    "type": "object",
                    "properties": {
                        "requestUrl": { "$ref": "#definitions/requestUrl" }
                    }
                },
                "OAuth2": {
                    "type": "object",
                    "properties": {
                        "clientId": { "$ref": "#definitions/clientId" },
                        "clientSecret": { "$ref": "#definitions/clientSecret" }
                    }
                }
            }
        },
        "MailAuth": {
            "title": "MailAuth",
            "type": "object",
            "properties": {
                "debug": { "$ref": "#definitions/debug" },
                "email": { "$ref": "#definitions/email" },
                "displayEmail": { "$ref": "#definitions/displayEmail" },
                "host": { "$ref": "#definitions/host" },
                "port": { "$ref": "#definitions/port" },
                "user": { "$ref": "#definitions/user" },
                "pass": { "$ref": "#definitions/pass" },
                "apiKey": { "$ref": "#definitions/apiKey" }
            }
        },
        "Mailgun": {
            "title": "MailAuth with Mailgun",
            "type": "object",
            "properties": {
                "apiKey": { "$ref": "#definitions/apiKey" },
                "domain": { "$ref": "#definitions/domain" }
            }
        },
        "GPGAuth": {
            "title": "GPGAuth",
            "type": "object",
            "properties": {
                "debug": { "$ref": "#definitions/debug" },
                "id": { "enum": ["gpg"] }
            }
        },
    }
};
tv4.addSchema(authDefinitions);
const authSchemas = [
    {
        "title": "OAuth 1.0A 3legged",
        "meta": { "client": one_1.default },
        "allOf": [
            { "$ref": "https://indieauth.com/IndieAuth#definitions/OAuth/definitions/basics" },
            { "$ref": "https://indieauth.com/IndieAuth#definitions/OAuth/definitions/OAuth1" },
            { "$ref": "https://indieauth.com/IndieAuth#definitions/OAuth/definitions/OAuth1_3legged" }
        ],
        "required": ["requestUrl", "authUrl", "accessUrl", "consumerKey", "consumerSecret"]
    },
    {
        "title": "OAuth 2 3legged",
        "meta": { "client": two_1.default },
        "allOf": [
            { "$ref": "https://indieauth.com/IndieAuth#definitions/OAuth/definitions/basics" },
            { "$ref": "https://indieauth.com/IndieAuth#definitions/OAuth/definitions/OAuth2" }
        ],
        "required": ["authUrl", "accessUrl", "clientId", "clientSecret"]
    },
    {
        "title": "MailAuth",
        "meta": { "client": MailAuth_1.default },
        "allOf": [
            { "$ref": "https://indieauth.com/IndieAuth#definitions/MailAuth" }
        ],
        "required": ["email", "host", "port", "user", "pass"]
    },
    {
        "title": "MailgunAuth",
        "meta": { "client": MailAuth_1.default },
        "allOf": [
            { "$ref": "https://indieauth.com/IndieAuth#definitions/MailAuth" },
            { "$ref": "https://indieauth.com/IndieAuth#definitions/Mailgun" }
        ],
        "required": ["email", "apiKey"]
    },
    {
        "title": "GPGAuth",
        "meta": { "client": GPGAuth_1.default },
        "allOf": [
            { "$ref": "https://indieauth.com/IndieAuth#definitions/GPGAuth" }
        ],
        "required": ["id"]
    }
];
function providerClient(o) {
    if (!!(o.email) && !!(o.host) && !!(o.port)) {
        if (!(o.user) && !!(o.key)) {
            o.user = o.key;
            delete o.key;
        }
        if (!(o.pass) && !!(o.secret)) {
            o.pass = o.secret;
            delete o.secret;
        }
    }
    else if (!!(o.requestUrl) && !!(o.authUrl) && !!(o.accessUrl)) {
        if (!(o.consumerKey) && !!(o.key)) {
            o.consumerKey = o.key;
            delete o.key;
        }
        if (!(o.consumerSecret) && !!(o.secret)) {
            o.consumerSecret = o.secret;
            delete o.secret;
        }
    }
    else if (!!(o.authUrl) && !!(o.accessUrl)) {
        if (!(o.clientId) && !!(o.key)) {
            o.clientId = o.key;
            delete o.key;
        }
        if (!(o.clientSecret) && !!(o.secret)) {
            o.clientSecret = o.secret;
            delete o.secret;
        }
    }
    else {
    }
    const errStatus = [];
    var i;
    for (i = 0; i < authSchemas.length; i++) {
        const _mixO = { IA: authSchemas[i].title };
        if (_mixO.IA === 'MailAuth' || _mixO.IA === 'MailgunAuth') {
            _mixO.expiration = config_1.expiration.mail;
        }
        else if (_mixO.IA === 'SMSAuth') {
            _mixO.expiration = config_1.expiration.sms;
        }
        const result = { valid: true };
        if (result.valid) {
            return (new authSchemas[i].meta.client(util_1.mixin({}, result, o, _mixO)));
        }
        errStatus.push(util_1.mixin(result, { title: _mixO.IA }));
    }
    return { valid: false, errors: errStatus };
}
exports.providerClient = providerClient;
//# sourceMappingURL=index.js.map