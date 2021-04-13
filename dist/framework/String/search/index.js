"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitap_1 = require("./bitap");
const isArrayTypes_1 = require("../../lang/isArrayTypes");
const deepValue_1 = require("./deepValue");
const dv = ['./', 'NO'];
class StringSearch {
    constructor(list, options) {
        this.properties = Object.assign({ location: 0, distance: 100, threshold: 0.6, maxPatternLength: 32, caseSensitive: false, tokenSeparator: / +/g, findAllMatches: false, minMatchCharLength: 1, id: null, keys: [], shouldSort: true, getFn: deepValue_1.default, sortFn: (a, b) => (a.score - b.score), tokenize: false, matchAllTokens: false, includeMatches: true, includeScore: true, verbose: false }, options);
        this._log(`---------\nSearch properties:`, this.properties);
        this.collection = list;
    }
    set collection(list) {
        this._list = list;
    }
    async test() {
        const widget = await Promise.resolve().then(() => require(dv[0] + 'deepValue'));
    }
    search(pattern) {
        this._log(`---------\nSearch pattern: "${pattern}"`);
        const { fullSearcher, tokenSearchers } = this._prepareSearchers(pattern);
        let { weights, results } = this._search(fullSearcher, tokenSearchers);
        this._computeScore(weights, results);
        if (this.properties.shouldSort) {
            this._sort(results);
        }
        return this._format(results);
    }
    _prepareSearchers(pattern = '') {
        const tokenSearchers = [];
        if (this.properties.tokenize) {
            const { tokenSeparator = / +/g } = this.properties;
            const tokens = pattern.split(tokenSeparator);
            for (let i = 0, len = tokens.length; i < len; i += 1) {
                tokenSearchers.push(new bitap_1.default(tokens[i], this.properties));
            }
        }
        let fullSearcher = new bitap_1.default(pattern, this.properties);
        return { tokenSearchers, fullSearcher };
    }
    _search(fullSearcher, tokenSearchers) {
        const { keys = [], getFn = deepValue_1.default } = this.properties;
        const list = this._list;
        const resultMap = {};
        const results = [];
        if (typeof list[0] === 'string') {
            for (let i = 0, len = list.length; i < len; i += 1) {
                this._analyze({
                    key: '',
                    value: list[i],
                    record: list[i],
                    index: i
                }, {
                    resultMap,
                    results,
                    tokenSearchers,
                    fullSearcher
                });
            }
            return { weights: null, results };
        }
        const weights = {};
        for (let i = 0, len = list.length; i < len; i += 1) {
            let item = list[i];
            for (let j = 0, keysLen = keys.length; j < keysLen; j += 1) {
                let key = keys[j];
                if (typeof key === 'object') {
                    weights[key.name] = { weight: (1 - key.weight) || 1 };
                    if (key.weight <= 0 || key.weight > 1) {
                        throw new Error('Key weight has to be > 0 and <= 1');
                    }
                    key = key.name;
                }
                else {
                    weights[key] = {
                        weight: 1
                    };
                }
                this._analyze({
                    key,
                    value: getFn(item, key),
                    record: item,
                    index: i
                }, {
                    resultMap,
                    results,
                    tokenSearchers,
                    fullSearcher
                });
            }
        }
        return { weights, results };
    }
    _analyze(options, searchers) {
        const { key, arrayIndex = -1, value, record, index } = options;
        if (!value) {
            return;
        }
        const { tokenSearchers, fullSearcher, resultMap = {}, results = [] } = searchers;
        const { tokenSeparator = / +/g, tokenize, matchAllTokens } = this.properties;
        let averageScore = -1;
        let numTextMatches = 0;
        if (typeof value === 'string') {
            this._log(`\nKey: ${key === '' ? '-' : key}`);
            let mainSearchResult = fullSearcher.search(value);
            this._log(`Full text: "${value}", score: ${mainSearchResult.score}`);
            if (tokenize) {
                let words = value.split(tokenSeparator);
                let scores = [];
                for (let i = 0; i < tokenSearchers.length; i += 1) {
                    let tokenSearcher = tokenSearchers[i];
                    this._log(`\nPattern: "${tokenSearcher.pattern}"`);
                    let hasMatchInText = false;
                    for (let j = 0; j < words.length; j += 1) {
                        let word = words[j];
                        let tokenSearchResult = tokenSearcher.search(word);
                        let obj = {};
                        if (tokenSearchResult.isMatch) {
                            obj[word] = tokenSearchResult.score;
                            hasMatchInText = true;
                            scores.push(tokenSearchResult.score);
                        }
                        else {
                            obj[word] = 1;
                            if (!matchAllTokens) {
                                scores.push(1);
                            }
                        }
                        this._log(`Token: "${word}", score: ${obj[word]}`);
                    }
                    if (hasMatchInText) {
                        numTextMatches += 1;
                    }
                }
                averageScore = scores[0];
                let scoresLen = scores.length;
                for (let i = 1; i < scoresLen; i += 1) {
                    averageScore += scores[i];
                }
                averageScore = averageScore / scoresLen;
                this._log('Token score average:', averageScore);
            }
            let finalScore = mainSearchResult.score;
            if (averageScore > -1) {
                finalScore = (finalScore + averageScore) / 2;
            }
            this._log('Score average:', finalScore);
            let checkTextMatches = (tokenize && matchAllTokens) ?
                numTextMatches >= tokenSearchers.length : true;
            this._log(`\nCheck Matches: ${checkTextMatches}`);
            if (checkTextMatches) {
                let existingResult = resultMap[index];
                if (existingResult) {
                    existingResult.output.push({
                        key,
                        arrayIndex,
                        value,
                        score: finalScore,
                        matchedIndices: mainSearchResult.matchedIndices
                    });
                }
                else {
                    resultMap[index] = {
                        item: record,
                        output: [{
                                key,
                                arrayIndex,
                                value,
                                score: finalScore,
                                matchedIndices: mainSearchResult.matchedIndices
                            }]
                    };
                    results.push(resultMap[index]);
                }
            }
        }
        else if (isArrayTypes_1.isArray(value)) {
            for (let i = 0, len = value.length; i < len; i += 1) {
                this._analyze({
                    key,
                    arrayIndex: i,
                    value: value[i],
                    record,
                    index
                }, {
                    resultMap,
                    results,
                    tokenSearchers,
                    fullSearcher
                });
            }
        }
    }
    _computeScore(weights, results) {
        this._log('\n\nComputing score:\n');
        for (let i = 0, len = results.length; i < len; i += 1) {
            const output = results[i].output;
            const scoreLen = output.length;
            let currScore = 1;
            let bestScore = 1;
            for (let j = 0; j < scoreLen; j += 1) {
                let weight = weights ? weights[output[j].key].weight : 1;
                let score = weight === 1 ? output[j].score : (output[j].score || 0.001);
                let nScore = score * weight;
                if (weight !== 1) {
                    bestScore = Math.min(bestScore, nScore);
                }
                else {
                    output[j].nScore = nScore;
                    currScore *= nScore;
                }
            }
            results[i].score = bestScore === 1 ? currScore : bestScore;
            this._log(results[i]);
        }
    }
    _sort(results) {
        this._log('\n\nSorting....');
        results.sort(this.properties.sortFn);
    }
    _format(results) {
        const { includeMatches, includeScore, verbose, id, getFn = deepValue_1.default } = this.properties;
        const finalOutput = [];
        let transformers = [];
        this._log('\n\nOutput:\n\n', JSON.stringify(results));
        if (includeMatches) {
            transformers.push((result, data) => {
                const output = result.output;
                data.matches = [];
                for (let i = 0, len = output.length; i < len; i += 1) {
                    let item = output[i];
                    if (item.matchedIndices.length === 0) {
                        continue;
                    }
                    let obj = {
                        indices: item.matchedIndices,
                        value: item.value
                    };
                    if (item.key) {
                        obj.key = item.key;
                    }
                    if (item.hasOwnProperty('arrayIndex') && item.arrayIndex > -1) {
                        obj.arrayIndex = item.arrayIndex;
                    }
                    data.matches.push(obj);
                }
            });
        }
        if (includeScore) {
            transformers.push((result, data) => {
                data.score = result.score;
            });
        }
        for (let i = 0, len = results.length; i < len; i += 1) {
            const result = results[i];
            if (id) {
                result.item = getFn(result.item, id)[0];
            }
            if (!transformers.length) {
                finalOutput.push(result.item);
                continue;
            }
            const data = { item: result.item };
            for (let j = 0, len = transformers.length; j < len; j += 1) {
                transformers[j](result, data);
            }
            finalOutput.push(data);
        }
        return finalOutput;
    }
    _log(...args) {
        if (this.properties.verbose) {
            console.log(...args);
        }
    }
}
exports.default = StringSearch;
//# sourceMappingURL=index.js.map