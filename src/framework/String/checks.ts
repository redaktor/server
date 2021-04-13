import { HasUnicode, HasUnicodeWord, UnicodeWord, AsciiWord, Unicode } from './regex/common';
/* EXPORTS WITH ONLY 1 ARGUMENT (a string) */
export function hasUnicode(str: string) {
  return HasUnicode.test(str);
}
export function hasUnicodeWord(str: string): boolean {
  return HasUnicodeWord.test(str);
}
export function unicodeWords(str: string): RegExpMatchArray {
  return str.match(UnicodeWord) || [];
}
export function asciiWords(str: string): RegExpMatchArray {
  return str.match(AsciiWord) || [];
}
export function stringToArray(str: string, splitter: string = '') {
  return hasUnicode(str) ? (str.match(Unicode) || []) : str.split(splitter);
}
