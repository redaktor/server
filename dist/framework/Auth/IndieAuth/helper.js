"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/has/has");
const lang = require("@dojo/framework/core/util");
const uriTemplates = require("uri-templates");
const webtoken_1 = require("../../JSON/webtoken");
const log_1 = require("../../log");
const startEnd_1 = require("../../String/startEnd");
const util_1 = require("./widgets/microformats/util");
const CLI_1 = require("./nls/CLI");
const providers = {
    authorization_endpoint: 1,
    askubuntu: 1,
    flickr: 1,
    github: 1,
    instagram: 1,
    mail: 1,
    pgpkey: 1,
    stackexchange: 1,
    stackoverflow: 1,
    superuser: 1,
    twitter: 1,
    youtube: 1
};
const _N = has_1.default('host-node');
const fs = (_N) ? require('fs') : {};
const path = (_N) ? require('path') : {};
const messages = CLI_1.default.messages;
exports.OS = (_N) ? process.platform : navigator.platform;
exports.userDir = (_N) ? process.env[(exports.OS === 'win32') ? 'USERPROFILE' : 'HOME'] : '~';
function _providerWarnings(_providers) {
    const status = { notFound: [], invalid: [], hasWarning: false };
    var key;
    for (key in _providers) {
        if (key === 'authorization_endpoint') {
            continue;
        }
        if (!(_providers[key].valid)) {
            const err = _providers[key].errors || [{}];
            const sKey = (err[0].code === 400) ? 'notFound' : 'invalid';
            status[sKey].push(key);
        }
    }
    status.hasWarning = (!!(status.notFound.length) || !!(status.invalid.length));
    if (status.hasWarning) {
        console.log(' ');
        console.log(messages.warning);
    }
    if (!!(status.notFound.length)) {
        doLog({ error: (messages.vNotFoundCred + ' : "' + status.notFound.join('", "') + '" !') });
    }
    if (!!(status.invalid.length)) {
        doLog({ error: (messages.vInvalidCred + ' : "' + status.invalid.join('", "') + '" !') });
    }
    if (status.hasWarning) {
        console.log('  ' + messages.vHintCred);
        console.log('  ');
    }
}
function providerLinkObj(my, url, userId, props) {
    let provider = Object.assign(Object.assign({ originalUrl: url, url: url, userId: userId }, (my['rel-urls'].hasOwnProperty(url) ? my['rel-urls'][url] : { text: url })), props);
    return provider;
}
function getProviders(pw = '', doWarn = true, exclEndpoint = false, inclSetup = false) {
    const _providers = {};
    const _hasPW = (pw !== '' && !!checkPW(pw));
    var key;
    for (key in providers) {
        if (!!(exclEndpoint) && key === 'authorization_endpoint') {
            continue;
        }
        const PROVIDER = providers[key].provider;
        const FAILED = lang.mixin({}, PROVIDER, {
            valid: false,
            errors: [{ message: messages.vNoCred, code: 400 }],
            client: null
        });
        if (!_hasPW) {
            _providers[key] = Object.assign({ valid: true }, PROVIDER);
        }
        else if (!!(_N)) {
            const _token = (key === 'pgpkey') ? {} : readToken(pw, key, this.subDir);
            const _options = { debug: this.debug };
            if (!(_token.callbackUrl) && !!(this._url)) {
                _options.callbackUrl = this._url;
            }
            if (!!(_token) && (key === 'pgpkey' || _token.statusCode === 200)) {
            }
            else {
                _providers[key] = (key === 'authorization_endpoint') ? PROVIDER : FAILED;
            }
        }
        else {
            _providers[key] = FAILED;
        }
        if (!!_providers[key].setup && !inclSetup) {
            delete _providers[key].setup;
        }
    }
    (!!((_N)) && !!(doWarn) && _providerWarnings(_providers));
    return Object.freeze(_providers);
}
exports.getProviders = getProviders;
function providerLinks(my, providers) {
    return (url) => {
        let i, key, o;
        let props = { key: false, url: url };
        let uId = '';
        providerLoop: for (key in providers) {
            const _provider = providers[key];
            if (!(_provider.me) || !(_provider.me.templates)) {
                continue;
            }
            for (i = 0; i < _provider.me.templates.length; i++) {
                uId = '';
                o = uriTemplates(_provider.me.templates[i]).fromUri(decodeURIComponent(url));
                if (!!o && typeof o.userId === 'string' && o.userId.length) {
                    uId = o.userId;
                }
                else if (!!o && Array.isArray(o.userId) && o.userId.length === 1) {
                    uId = o.userId[0];
                }
                if (uId !== '') {
                    props = { key: key, valid: _provider.valid, me: _provider.me, display: uId };
                    props.url = uriTemplates(props.me.target).fillFromObject(Object.assign(Object.assign({}, o), { userId: uId }));
                    break providerLoop;
                }
                else {
                    props.display = util_1.displayUrl(props.url);
                }
            }
        }
        return providerLinkObj(my, url, uId, props);
    };
}
exports.providerLinks = providerLinks;
function endpointLinks(my, endpoints = []) {
    ['authorization_endpoint', 'pgpkey'].forEach((key) => {
        if (my.rels.hasOwnProperty(key) && !!(my['rel-urls'])) {
            endpoints = my.rels[key].map((url) => {
                const _o = { key: key, valid: true, display: util_1.displayUrl(url), url: url };
                return providerLinkObj(my, url, url, _o);
            });
        }
    });
    return endpoints;
}
exports.endpointLinks = endpointLinks;
function validFirst(a, b) {
    var isP = [(!!(a.valid) && !!(a.key)), (!!(b.valid) && !!(b.key))];
    if (!!isP[0] && !isP[1]) {
        return -1;
    }
    if (!!isP[1] && !isP[0]) {
        return 1;
    }
    return 0;
}
exports.validFirst = validFirst;
function getTokenChoices(subDir = '.IndieAuth') {
    if (!(_N)) {
        throw new Error('requires node.js');
    }
    const dir = path.resolve(exports.userDir, subDir);
    return fs.readdirSync(dir)
        .filter((file) => {
        try {
            const stats = fs.lstatSync(path.join(dir, file));
            if (stats.isSymbolicLink()) {
                return false;
            }
            const isDir = stats.isDirectory();
            const isDotFile = (path.basename(file).indexOf('.') === 0);
            const hasJWT = (file !== 'IndieAuth.jwt' && path.extname(file) === '.jwt');
            return (!(isDir) && !(isDotFile) && hasJWT);
        }
        catch (error) {
            return false;
        }
    })
        .map((file) => ({ name: file, value: path.basename(file, '.jwt') }))
        .sort();
}
exports.getTokenChoices = getTokenChoices;
function readToken(pw, fileBaseName = 'IndieAuth', subDir = '.IndieAuth') {
    if (!(_N)) {
        throw new Error('requires node.js');
    }
    const dir = path.resolve(exports.userDir, subDir);
    const fileName = [fileBaseName, 'jwt'].join('.');
    try {
        const jwTokenR = fs.readFileSync(path.resolve(dir, fileName), 'utf8');
        return (webtoken_1.default.decode(jwTokenR, pw) || {});
    }
    catch (e) {
        if (fileBaseName === 'IndieAuth') {
        }
        return {};
    }
}
exports.readToken = readToken;
function writeToken(o, pw, subDir = '.IndieAuth') {
    if (!(_N)) {
        throw new Error('requires node.js');
    }
    const dir = path.resolve(exports.userDir, subDir);
    const tokenRes = (!!(o.providerID) ? { provider: o.providerID } : o);
    const fileName = [(!!(o.providerID) ? o.providerID : 'IndieAuth'), 'jwt'].join('.');
    let stats = {};
    if (fileName !== 'IndieAuth.jwt') {
        try {
            stats = fs.lstatSync(path.join(dir, fileName));
        }
        catch (e) { }
        var key;
        for (key in o) {
            if (startEnd_1.start(key, 'provider_')) {
                tokenRes[key.replace('provider_', '')] = o[key];
            }
        }
    }
    const cDate = (!!(stats.birthtime)) ? stats.birthtime : (new Date());
    const uDate = (!!(stats.birthtime)) ? (new Date()) : null;
    const content = Object.assign({ statusCode: 200, iat: cDate, uat: uDate }, tokenRes);
    const jwTokenW = webtoken_1.default.encode(content, pw, 'sha256');
    try {
        fs.writeFileSync(path.resolve(dir, fileName), jwTokenW, 'utf8');
    }
    catch (e) {
        return false;
    }
    return jwTokenW;
}
exports.writeToken = writeToken;
function checkPW(pw) {
    if (!(_N)) {
        throw new Error('requires node.js');
    }
    const jwToken = (typeof pw === 'string') ? readToken(pw) : void 0;
    if (typeof jwToken !== 'object' || !(jwToken.salt) || jwToken.statusCode !== 200) {
        return void 0;
    }
    return jwToken;
}
exports.checkPW = checkPW;
function doLog(logArr, doPadding = false, inclFn = false) {
    if (!Array.isArray(logArr)) {
        logArr = [logArr];
    }
    log_1.log(logArr, doPadding, inclFn);
}
exports.doLog = doLog;
function logToken(token, title = '') {
    const o = lang.mixin({}, token);
    const dateOptions = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
    };
    Object.keys(o).forEach((key) => {
        if ((key === 'iat' || key === 'uat') && !!(token[key])) {
            o[key] = new Date(o[key]).toLocaleDateString(['en', 'de'], dateOptions);
        }
        if (key.indexOf('secret') > -1) {
            o[key] = log_1.pwLog(o[key], 2);
        }
    });
    doLog([
        { success: ['JWT credentials for ' + ((title === '') ? token.provider : title) + ' :'] },
        { list: o }
    ], true);
}
exports.logToken = logToken;
//# sourceMappingURL=helper.js.map