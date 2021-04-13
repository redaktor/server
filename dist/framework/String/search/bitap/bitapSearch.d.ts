export declare function bitapScore(pattern: string, { errors, current, expected, distance }: {
    errors?: number;
    current?: number;
    expected?: number;
    distance?: number;
}): number;
export declare function matchedIndices(matchmask?: any[], minMatchCharLength?: number): any[];
export default function bitapSearch(text: string, pattern: string, patternAlphabet: any, { location, distance, threshold, findAllMatches, minMatchCharLength }: {
    location?: number;
    distance?: number;
    threshold?: number;
    findAllMatches?: boolean;
    minMatchCharLength?: number;
}): {
    isMatch: boolean;
    score: number;
    matchedIndices: any[];
};
