"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function bitapScore(pattern, { errors = 0, current = 0, expected = 0, distance = 100 }) {
    const accuracy = errors / pattern.length;
    const proximity = Math.abs(expected - current);
    if (!distance) {
        return proximity ? 1.0 : accuracy;
    }
    return accuracy + (proximity / distance);
}
exports.bitapScore = bitapScore;
function matchedIndices(matchmask = [], minMatchCharLength = 1) {
    let matchedIndices = [];
    let [start, end, i] = [-1, -1, 0];
    for (let len = matchmask.length; i < len; i += 1) {
        let match = matchmask[i];
        if (match && start === -1) {
            start = i;
        }
        else if (!match && start !== -1) {
            end = i - 1;
            if ((end - start) + 1 >= minMatchCharLength) {
                matchedIndices.push([start, end]);
            }
            start = -1;
        }
    }
    if (matchmask[i - 1] && (i - start) >= minMatchCharLength) {
        matchedIndices.push([start, i - 1]);
    }
    return matchedIndices;
}
exports.matchedIndices = matchedIndices;
function bitapSearch(text, pattern, patternAlphabet, { location = 0, distance = 100, threshold = 0.6, findAllMatches = false, minMatchCharLength = 1 }) {
    const expected = location;
    const textLen = text.length;
    let currentThreshold = threshold;
    let bestLocation = text.indexOf(pattern, expected);
    let current = bestLocation;
    const patternLen = pattern.length;
    const matchMask = [];
    for (let i = 0; i < textLen; i += 1) {
        matchMask[i] = 0;
    }
    if (bestLocation !== -1) {
        let score = bitapScore(pattern, { errors: 0, current, expected, distance });
        currentThreshold = Math.min(score, currentThreshold);
        current = bestLocation = text.lastIndexOf(pattern, expected + patternLen);
        if (bestLocation !== -1) {
            let score = bitapScore(pattern, { errors: 0, current, expected, distance });
            currentThreshold = Math.min(score, currentThreshold);
        }
    }
    bestLocation = -1;
    let lastBitArr = [];
    let finalScore = 1;
    let binMax = patternLen + textLen;
    const mask = 1 << (patternLen - 1);
    for (let errors = 0; errors < patternLen; errors += 1) {
        let binMin = 0;
        let binMid = binMax;
        while (binMin < binMid) {
            const current = expected + binMid;
            const score = bitapScore(pattern, { errors, current, expected, distance });
            if (score <= currentThreshold) {
                binMin = binMid;
            }
            else {
                binMax = binMid;
            }
            binMid = Math.floor((binMax - binMin) / 2 + binMin);
        }
        binMax = binMid;
        let start = Math.max(1, expected - binMid + 1);
        let finish = findAllMatches ? textLen : Math.min(expected + binMid, textLen) + patternLen;
        let bitArr = Array(finish + 2);
        bitArr[finish + 1] = (1 << errors) - 1;
        for (let j = finish; j >= start; j -= 1) {
            let current = j - 1;
            let charMatch = patternAlphabet[text.charAt(current)];
            if (charMatch) {
                matchMask[current] = 1;
            }
            bitArr[j] = ((bitArr[j + 1] << 1) | 1) & charMatch;
            if (errors !== 0) {
                bitArr[j] |= (((lastBitArr[j + 1] | lastBitArr[j]) << 1) | 1) | lastBitArr[j + 1];
            }
            if (bitArr[j] & mask) {
                const lengthProximity = text.length > pattern.length ?
                    (text.length / pattern.length / distance) : (pattern.length / text.length / distance);
                const score = bitapScore(pattern, { errors, current, expected, distance });
                finalScore = Math.min(score + lengthProximity, 1);
                if (finalScore <= currentThreshold) {
                    currentThreshold = finalScore;
                    bestLocation = current;
                    if (bestLocation <= expected) {
                        break;
                    }
                    start = Math.max(1, 2 * expected - bestLocation);
                }
            }
        }
        const score = bitapScore(pattern, {
            errors: errors + 1,
            current: expected,
            expected,
            distance
        });
        if (score > currentThreshold) {
            break;
        }
        lastBitArr = bitArr;
    }
    return {
        isMatch: bestLocation >= 0,
        score: finalScore === 0 ? 0.001 : finalScore,
        matchedIndices: matchedIndices(matchMask, minMatchCharLength)
    };
}
exports.default = bitapSearch;
//# sourceMappingURL=bitapSearch.js.map