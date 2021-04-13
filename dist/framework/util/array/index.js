"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function _createTree(array, rootNodes, idProperty) {
    var tree = [];
    for (var n in rootNodes) {
        var node = rootNodes[n];
        var childNode = array[node[idProperty]];
        if (!node && !rootNodes.hasOwnProperty(n)) {
            continue;
        }
        if (childNode) {
            node.children = _createTree(array, childNode, idProperty);
        }
        tree.push(node);
    }
    return tree;
}
;
function _groupByParents(array, options) {
    return array.reduce(function (prev, item) {
        var parentId = item[options.parentProperty] || options.rootID;
        if (parentId && prev.hasOwnProperty(parentId)) {
            prev[parentId].push(item);
            return prev;
        }
        prev[parentId] = [item];
        return prev;
    }, {});
}
;
function flatten(...arr) {
    const flat = [].concat(...arr);
    return flat.some(Array.isArray) ? flatten(flat) : flat;
}
exports.flatten = flatten;
function flattenTree(arr, cKey = 'children') {
    if (!Array.isArray(arr)) {
        arr = [arr];
    }
    const flatTree = (o) => {
        if (Array.isArray(o[cKey]) && o[cKey].length) {
            arr = arr.concat(o[cKey]);
            o[cKey].map(flatTree);
        }
    };
    arr.map(flatTree);
    return arr;
}
exports.flattenTree = flattenTree;
function toTree(data, options) {
    if (typeof data != 'object') {
        return [{
                id: 'root',
                parent: null,
                children: [],
                value: data
            }];
    }
    else {
        if (!Array.isArray(data)) {
            data = [data];
        }
    }
    options = Object.assign({
        idProperty: 'id',
        parentProperty: 'parent',
        id: 'root',
        rootID: '$0'
    }, options);
    var grouped = _groupByParents(data, options);
    return _createTree(grouped, grouped[options.rootID], options.idProperty);
}
exports.toTree = toTree;
;
function toObject(keys) {
    return (keys && Array.isArray(keys)) ?
        (o, v, i) => { o[keys[i]] = v; return (o || {}); } :
        (o, v, i) => { o[i] = v; return (o || {}); };
}
exports.toObject = toObject;
function hasL(a, l) {
    if (!l)
        l = 0;
    return (a && a instanceof Array && a.length > l) ? a.length : 0;
}
exports.hasL = hasL;
//# sourceMappingURL=index.js.map