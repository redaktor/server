"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
exports.rsComboSymbolsRange = '\\u20d0-\\u20f0';
const comboMark = RegExp(`[${exports.rsComboMarksRange}${exports.rsComboSymbolsRange}]`, 'g');
exports.default = comboMark;
//# sourceMappingURL=regexComboMark.js.map