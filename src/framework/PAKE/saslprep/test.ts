import { test, runIfMain } from "./mod";

import {
  assertEquals,
  assertThrows
} from "https://deno.land/std/testing/asserts";

import { saslprep } from "./mod";

const chr: (...codepoints: number[]) => string = String.fromCodePoint;

test({
  name: "should work with liatin letters",
  fn(): void {
    const str: string = "user";
    assertEquals(saslprep(str), str);
  }
});

test({
  name: "should work be case preserved",
  fn(): void {
    const str: string = "USER";
    assertEquals(saslprep(str), str);
  }
});

test({
  name: "should work with high code points (> U+FFFF)",
  fn(): void {
    const str: string = "\uD83D\uDE00";
    assertEquals(saslprep(str, { allowUnassigned: true }), str);
  }
});

test({
  name: "should remove `mapped to nothing` characters",
  fn(): void {
    assertEquals(saslprep("I\u00ADX"), "IX");
  }
});

test({
  name: "should replace `Non-ASCII space characters` with space",
  fn(): void {
    assertEquals(saslprep("a\u00A0b"), "a\u0020b");
  }
});

test({
  name: "should normalize \u00AA as NFKC",
  fn(): void {
    assertEquals(saslprep("\u00AA"), "a");
  }
});

test({
  name: "should normalize \u2168 as NFKC",
  fn(): void {
    assertEquals(saslprep("\u2168"), "IX");
  }
});

test({
  name: "should throws when prohibited characters",
  fn(): void {
    // C.2.1 ASCII control characters
    assertThrows(
      (): void => {
        saslprep("a\u007Fb");
      }
    );

    // C.2.2 Non-ASCII control characters
    assertThrows(
      (): void => {
        saslprep("a\u06DDb");
      }
    );

    // C.3 Private use
    assertThrows(
      (): void => {
        saslprep("a\uE000b");
      }
    );

    // C.4 Non-character code points
    assertThrows(
      (): void => {
        saslprep(`a${chr(0x1fffe)}b`);
      }
    );

    // C.5 Surrogate codes
    assertThrows(
      (): void => {
        saslprep("a\uD800b");
      }
    );

    // C.6 Inappropriate for plain text
    assertThrows(
      (): void => {
        saslprep("a\uFFF9b");
      }
    );

    // C.7 Inappropriate for canonical representation
    assertThrows(
      (): void => {
        saslprep("a\u2FF0b");
      }
    );

    // C.8 Change display properties or are deprecated
    assertThrows(
      (): void => {
        saslprep("a\u200Eb");
      }
    );

    // C.9 Tagging characters
    assertThrows(
      (): void => {
        saslprep(`a${chr(0xe0001)}b`);
      }
    );
  }
});

test({
  name: "should not containt RandALCat and LCat bidi",
  fn(): void {
    assertThrows(
      (): void => {
        saslprep("a\u06DD\u00AAb");
      }
    );
  }
});

test({
  name: "RandALCat should be first and last",
  fn(): void {
    saslprep("\u0627\u0031\u0628");
    assertThrows(
      (): void => {
        saslprep("\u0627\u0031");
      }
    );
  }
});

test({
  name: "should handle unassigned code points",
  fn(): void {
    saslprep("a\u0487", { allowUnassigned: true });
    assertThrows(
      (): void => {
        saslprep("a\u0487");
      }
    );
  }
});

runIfMain(import.meta, { parallel: true });
