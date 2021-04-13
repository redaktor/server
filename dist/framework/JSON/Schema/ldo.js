"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../../../dojo/core/main");
const main_2 = require("../../util/main");
const minimatch = require("minimatch");
const uriTemplates = require("uri-templates");
function expressSyntax(arg, ldo, customCat) {
    var explode = (arg.slice(-1) === '*') ? '*' : '';
    var key = ((explode === '*') ? arg.slice(0, -1) : arg).split(':')[0];
    var cat = (customCat) ? customCat : 'params';
    if (typeof ldo === 'object' && ldo.hasOwnProperty('schema')) {
        var res = main_2.getProperty(ldo.schema, ['properties', cat, 'properties', key, 'pattern'].join('.'));
        if (res) {
            return [key, '(', res, ')', explode].join('');
        }
    }
    return [key, explode].join('');
}
function expressPath(_, op, args) {
    return args.split(',').map(function (arg) {
        return [op, ':', expressSyntax(arg, this)].join('');
    }).join('');
}
function expressAnchor(_, arg) {
    return ['(?:[/]*)?#:', expressSyntax(arg, this, 'anchor')].join('');
}
function toRoutes(ldo = {}, i) {
    if (!this._if) {
        this._if = {};
    }
    const ID = (typeof ldo.id === 'string' && ldo.id.length) ? ldo.id.replace(/(^[#]*)/, '') : 'link' + i;
    var ldoTpl = Object.create(uriTemplates(ldo.href));
    ldo = main_1.lang.mixin(ldoTpl, ldo);
    for (var glob in this._if) {
        if (ID != glob && minimatch(ID, glob)) {
            if (!this._if.hasOwnProperty(ID)) {
                this._if[ID] = new Array();
            }
            Array.prototype.push.apply(this._if[ID], this._if[glob]);
        }
    }
    var o = {
        linkId: i,
        ldo: ldo,
        method: (ldo.method || 'GET').toLowerCase(),
        path: ldo.href.replace(/(\{\+)/g, '{')
            .replace(/(\{[?&].*\})/g, '')
            .replace(/\{([./])?([^}]*)\}/g, expressPath.bind(ldo))
            .replace(/\{[#]([^}]*)\}/g, expressAnchor.bind(ldo))
    };
    if (this._if.hasOwnProperty(ID)) {
        this._if[ID].unshift(o);
        this[o.method].apply(this, this._if[ID]);
    }
    return o;
}
exports.default = toRoutes;
//# sourceMappingURL=ldo.js.map