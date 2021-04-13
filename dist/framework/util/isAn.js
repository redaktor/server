"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../../dojo/core/main");
const formats_1 = require("./formats");
const lang_1 = require("./lang");
function _getFormat(type, describe) {
    if (describe !== true) {
        return type;
    }
    var o = {
        id: type,
        description: ['The JS', type, 'type.'].join(' ')
    };
    if (formats_1.SCHEMATYPES.hasOwnProperty(type)) {
        main_1.lang.mixin(o, formats_1.SCHEMATYPES[type] || { description: '' });
    }
    formats_1.TYPES.map((fO) => {
        if (fO.id === type) {
            o = main_1.lang.mixin(fO, formats_1.SCHEMATYPES[type] || { description: '' });
        }
    });
    return o;
}
function _getChildren(data, rootArr, formatO, describe) {
    if (!formatO.hasOwnProperty('children') || !Array.isArray(formatO.children)) {
        return rootArr;
    }
    formatO.children.map((format) => {
        if (format.is(data)) {
            rootArr.push(_getFormat(format.id, describe));
            if (format.hasOwnProperty('children') && Array.isArray(format.children)) {
                rootArr = _getChildren(data, rootArr, format, describe);
            }
        }
        return format;
    });
    return rootArr;
}
function isAn(data, typeOrDescribe) {
    const type = is(data);
    if ((data === void 0 && typeof typeOrDescribe === 'string' && typeOrDescribe !== 'undefined') ||
        (data === null && typeof typeOrDescribe === 'string' && typeOrDescribe !== 'null')) {
        return false;
    }
    const root = [_getFormat(type, typeOrDescribe)];
    if (lang_1.getDottedProperty(formats_1.SCHEMATYPES, [type, 'format'])) {
        if (formats_1.SCHEMATYPES[type].format.parent) {
            var pType = formats_1.SCHEMATYPES[type].format.parent;
            if (typeOrDescribe === true) {
                root[0].parent = pType;
            }
            root.unshift(_getFormat(pType, typeOrDescribe));
        }
        return _getChildren(data, root, formats_1.SCHEMATYPES[type].format, typeOrDescribe);
    }
    if (typeOrDescribe !== true) {
        root[0] = root[0].id;
    }
    if (typeof typeOrDescribe === 'string') {
        return (root.indexOf(typeOrDescribe) >= 0);
    }
    return root;
}
exports.isAn = isAn;
function str(s) {
    return (typeof s === 'string' && s.trim() !== '');
}
//# sourceMappingURL=isAn.js.map