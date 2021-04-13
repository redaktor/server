"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authorization_endpoint_1 = require("../authProviders/authorization_endpoint");
const askubuntu_1 = require("../authProviders/askubuntu");
const flickr_1 = require("../authProviders/flickr");
const github_1 = require("../authProviders/github");
const gpg_1 = require("../authProviders/gpg");
const instagram_1 = require("../authProviders/instagram");
const mail_1 = require("../authProviders/mail");
const stackexchange_1 = require("../authProviders/stackexchange");
const stackoverflow_1 = require("../authProviders/stackoverflow");
const superuser_1 = require("../authProviders/superuser");
const twitter_1 = require("../authProviders/twitter");
const youtube_1 = require("../authProviders/youtube");
const indieAuthProviders = {
    authorization_endpoint: authorization_endpoint_1.default,
    askubuntu: askubuntu_1.default,
    flickr: flickr_1.default,
    github: github_1.default,
    instagram: instagram_1.default,
    mail: mail_1.default,
    pgpkey: gpg_1.default,
    stackexchange: stackexchange_1.default,
    stackoverflow: stackoverflow_1.default,
    superuser: superuser_1.default,
    twitter: twitter_1.default,
    youtube: youtube_1.default
};
exports.default = indieAuthProviders;
//# sourceMappingURL=providers.js.map