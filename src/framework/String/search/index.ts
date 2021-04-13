import Bitap, { BitapProperties, BitapResult } from './bitap';
import { isArray } from '../../lang/isArrayTypes';
import deepValue from './deepValue';

const dv = ['./', 'NO'];

/* // TODO:
https://github.com/amsqr/Spanish-Metaphone/blob/master/phonetic_algorithms_es.py

https://pdfs.semanticscholar.org/5b5c/a878c534aee3882a038ef9e82f46e102131b.pdf
https://github.com/jordanthomas/jaro-winkler/blob/master/index.js
Burkhard-Keller :
https://github.com/yellowiscool/bktree-javascript/blob/master/bktree.js
https://github.com/ijkilchenko/Fuzbal -> node
*/

type GetFn = (obj: any, path?: string | null, list?: any[]) => any[];
type SortFn = (a: SearchResult, b: SearchResult) => number;
interface AnalyzeOptions {
  key: string | undefined;
  arrayIndex?: number;
  index: number;
  value: string | string[];
  record: any; // TODO
}
interface AnalyzeSearchers {
  tokenSearchers: any[]; // TODO
  fullSearcher: any; // TODO
  resultMap: any,
  results: any[]
}

export interface SearchProperties extends BitapProperties {
  id?: string | null;
  keys?: any[];
  shouldSort?: boolean;
  getFn?: GetFn | undefined;
  sortFn?: SortFn;
  tokenize?: boolean;
  matchAllTokens?: boolean;
  includeMatches?: boolean;
  includeScore?: boolean;
  verbose?: boolean;
}
export interface SearchResult extends BitapResult {
  /*
    isMatch: boolean;
    score: number;
    matchedIndices: any[];
  */
  matches: any[];
  item: any[];
  output: any; // TODO
}

export default class StringSearch {
  protected properties: SearchProperties;
  protected _list: string[];
  set collection(list: string[]) {
    this._list = list;
  }

  constructor (list: any[], options: SearchProperties) {
    this.properties = {
      // Approximately where in the text is the pattern expected to be found?
      location: 0,
      // Determines how close the match must be to the fuzzy location (specified above).
      // An exact letter match which is 'distance' characters away from the fuzzy location
      // would score as a complete mismatch. A distance of '0' requires the match be at
      // the exact location specified, a threshold of '1000' would require a perfect match
      // to be within 800 characters of the fuzzy location to be found using a 0.8 threshold.
      distance: 100,
      // At what point does the match algorithm give up. A threshold of '0.0' requires a perfect match
      // (of both letters and location), a threshold of '1.0' would match anything.
      threshold: 0.6,
      // Machine word size
      maxPatternLength: 32,
      // Indicates whether comparisons should be case sensitive.
      caseSensitive: false,
      // Regex used to separate words when searching. Only applicable when `tokenize` is `true`.
      tokenSeparator: / +/g,
      // When true, the algorithm continues searching to the end of the input even if a perfect
      // match is found before the end of the same input.
      findAllMatches: false,
      // Minimum number of characters that must be matched before a result is considered a match
      minMatchCharLength: 1,
      // The name of the identifier property. If specified, the returned result will be a list
      // of the items' identifiers, otherwise it will be a list of the items.
      id: null,
      // List of properties that will be searched. This also supports nested properties.
      keys: [],
      // Whether to sort the result list, by score
      shouldSort: true,
      // The get function to use when fetching an object's properties.
      // The default will search nested paths *ie foo.bar.baz*
      getFn: deepValue,
      // Default sort function
      sortFn: (a: SearchResult, b: SearchResult) => (a.score - b.score),
      // When true, the search algorithm will search individual words **and** the full string,
      // computing the final score as a function of both. Note that when `tokenize` is `true`,
      // the `threshold`, `distance`, and `location` are inconsequential for individual tokens.
      tokenize: false,
      // When true, the result set will only include records that match all tokens. Will only work
      // if `tokenize` is also true.
      matchAllTokens: false,

      includeMatches: true,
      includeScore: true,

      // Will print to the console. Useful for debugging.
      verbose: false,
      ...options
    };
    this._log(`---------\nSearch properties:`, this.properties);
    this.collection = list;
  }

  async test(){
    const widget = await import(dv[0]+'deepValue');

  }

  search (pattern: string) {
    this._log(`---------\nSearch pattern: "${pattern}"`);
    const { fullSearcher, tokenSearchers } = this._prepareSearchers(pattern);
    let { weights, results } = this._search(fullSearcher, tokenSearchers);
    this._computeScore(weights, results);
    if (this.properties.shouldSort) {
      this._sort(results)
    }
    return this._format(results)
  }

  _prepareSearchers(pattern = '') {
    const tokenSearchers = [];
    if (this.properties.tokenize) {
      const { tokenSeparator = / +/g } = this.properties;
      const tokens = pattern.split(tokenSeparator);
      for (let i = 0, len = tokens.length; i < len; i += 1) {
        tokenSearchers.push(new Bitap(tokens[i], this.properties))
      }
    }
    let fullSearcher = new Bitap(pattern, this.properties);
    return { tokenSearchers, fullSearcher }
  }

  _search (fullSearcher: Bitap, tokenSearchers: any[]) {
    const {keys = [], getFn = deepValue} = this.properties;
    const list = this._list;

    const resultMap = {};
    const results: any[] = [];

    // Check the first item in the list, if it's a string, then we assume that
    // every item in the list is also a string, and thus it's a flattened array.
    if (typeof list[0] === 'string') {
      // Iterate over every item
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
        })
      }
      return { weights: null, results }
    }

    // Otherwise, the first item is an Object (hopefully), and thus
    // the searching is done on the values of the keys of each item.
    const weights: any = {}
    for (let i = 0, len = list.length; i < len; i += 1) {
      let item = list[i];
      // Iterate over every key
      for (let j = 0, keysLen = keys.length; j < keysLen; j += 1) {
        let key = keys[j]
        if (typeof key === 'object') {
          weights[key.name] = { weight: (1 - key.weight) || 1 };
          if (key.weight <= 0 || key.weight > 1) {
            throw new Error('Key weight has to be > 0 and <= 1')
          }
          key = key.name
        } else {
          weights[key] = {
            weight: 1
          }
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
        })
      }
    }

    return { weights, results }
  }

  _analyze (options: AnalyzeOptions, searchers: AnalyzeSearchers) {
    const { key, arrayIndex = -1, value, record, index } = options;
    if (!value) { return }
    const { tokenSearchers, fullSearcher, resultMap = {}, results = [] } = searchers;
    const { tokenSeparator = / +/g, tokenize, matchAllTokens } = this.properties;
    // Check if the text can be searched let exists = false;
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
            let obj: any = {};
            if (tokenSearchResult.isMatch) {
              obj[word] = tokenSearchResult.score;
              //exists = true;
              hasMatchInText = true;
              scores.push(tokenSearchResult.score)
            } else {
              obj[word] = 1;
              if (!matchAllTokens) {
                scores.push(1)
              }
            }
            this._log(`Token: "${word}", score: ${obj[word]}`)
            // tokenScores.push(obj)
          }

          if (hasMatchInText) {
            numTextMatches += 1;
          }
        }
        averageScore = scores[0];
        let scoresLen = scores.length;
        for (let i = 1; i < scoresLen; i += 1) {
          averageScore += scores[i]
        }
        averageScore = averageScore / scoresLen;
        this._log('Token score average:', averageScore)
      }
      let finalScore = mainSearchResult.score;
      if (averageScore > -1) {
        finalScore = (finalScore + averageScore) / 2
      }
      this._log('Score average:', finalScore);
      let checkTextMatches = (tokenize && matchAllTokens) ?
        numTextMatches >= tokenSearchers.length : true;
      this._log(`\nCheck Matches: ${checkTextMatches}`);

      // If a match is found, add the item to <rawResults>, including its score
      if (checkTextMatches) {
        // Check if the item already exists in our results
        let existingResult = resultMap[index];
        if (existingResult) {
          // Use the lowest score
          // existingResult.score, bitapResult.score
          existingResult.output.push({
            key,
            arrayIndex,
            value,
            score: finalScore,
            matchedIndices: mainSearchResult.matchedIndices
          })
        } else {
          // Add it to the raw result list
          resultMap[index] = {
            item: record,
            output: [{
              key,
              arrayIndex,
              value,
              score: finalScore,
              matchedIndices: mainSearchResult.matchedIndices
            }]
          }
          results.push(resultMap[index])
        }
      }
    } else if (isArray(value)) {
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
        })
      }
    }
  }

  _computeScore (weights: any[], results: SearchResult[]) {
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
        } else {
          output[j].nScore = nScore;
          currScore *= nScore;
        }
      }
      results[i].score = bestScore === 1 ? currScore : bestScore;
      this._log(results[i])
    }
  }

  _sort (results: SearchResult[]) {
    this._log('\n\nSorting....');
    results.sort(this.properties.sortFn)
  }

  _format (results: SearchResult[]) {
    const {
      includeMatches, includeScore, verbose, id, getFn = deepValue
    } = this.properties;
    const finalOutput = [];
    let transformers = [];
    this._log('\n\nOutput:\n\n', JSON.stringify(results));

    if (includeMatches) {
      transformers.push((result: SearchResult, data: SearchResult) => {
        const output = result.output;
        data.matches = [];

        for (let i = 0, len = output.length; i < len; i += 1) {
          let item = output[i];
          if (item.matchedIndices.length === 0) { continue }
          let obj: any = {
            indices: item.matchedIndices,
            value: item.value
          };
          if (item.key) {
            obj.key = item.key
          }
          if (item.hasOwnProperty('arrayIndex') && item.arrayIndex > -1) {
            obj.arrayIndex = item.arrayIndex;
          }
          data.matches.push(obj);
        }
      })
    }
    if (includeScore) {
      transformers.push((result: SearchResult, data: SearchResult) => {
        data.score = result.score
      })
    }
    for (let i = 0, len = results.length; i < len; i += 1) {
      const result = results[i];
      if (id) {
        result.item = getFn(result.item, id)[0]
      }
      if (!transformers.length) {
        finalOutput.push(result.item);
        continue
      }
      const data: any = { item: result.item };
      for (let j = 0, len = transformers.length; j < len; j += 1) {
        transformers[j](result, data)
      }
      finalOutput.push(data)
    }
    return finalOutput
  }

  _log (...args: any[]) {
    if (this.properties.verbose) {
      console.log(...args)
    }
  }
}
