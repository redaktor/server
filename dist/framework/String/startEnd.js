"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function start(str, target, position = 0) {
    if (length) {
        return str.slice(0, Math.max(length || 1, 1));
    }
    target = `${target}`;
    const pos = Math.max(position, 0);
    return (str.slice(position, position + target.length) === target);
}
exports.start = start;
function end(str, target, position = str.length) {
    if (length) {
        return str.slice(0 - Math.max(length || 1, 1));
    }
    target = `${target}`;
    const _end = position = Math.max(position, 0);
    position -= target.length;
    return position >= 0 && str.slice(position, _end) === target;
}
exports.end = end;
//# sourceMappingURL=startEnd.js.map