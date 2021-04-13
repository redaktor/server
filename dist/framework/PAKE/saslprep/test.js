"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("./mod");
const asserts_1 = require("https://deno.land/std/testing/asserts");
const mod_2 = require("./mod");
const chr = String.fromCodePoint;
mod_1.test({
    name: "should work with liatin letters",
    fn() {
        const str = "user";
        asserts_1.assertEquals(mod_2.saslprep(str), str);
    }
});
mod_1.test({
    name: "should work be case preserved",
    fn() {
        const str = "USER";
        asserts_1.assertEquals(mod_2.saslprep(str), str);
    }
});
mod_1.test({
    name: "should work with high code points (> U+FFFF)",
    fn() {
        const str = "\uD83D\uDE00";
        asserts_1.assertEquals(mod_2.saslprep(str, { allowUnassigned: true }), str);
    }
});
mod_1.test({
    name: "should remove `mapped to nothing` characters",
    fn() {
        asserts_1.assertEquals(mod_2.saslprep("I\u00ADX"), "IX");
    }
});
mod_1.test({
    name: "should replace `Non-ASCII space characters` with space",
    fn() {
        asserts_1.assertEquals(mod_2.saslprep("a\u00A0b"), "a\u0020b");
    }
});
mod_1.test({
    name: "should normalize \u00AA as NFKC",
    fn() {
        asserts_1.assertEquals(mod_2.saslprep("\u00AA"), "a");
    }
});
mod_1.test({
    name: "should normalize \u2168 as NFKC",
    fn() {
        asserts_1.assertEquals(mod_2.saslprep("\u2168"), "IX");
    }
});
mod_1.test({
    name: "should throws when prohibited characters",
    fn() {
        asserts_1.assertThrows(() => {
            mod_2.saslprep("a\u007Fb");
        });
        asserts_1.assertThrows(() => {
            mod_2.saslprep("a\u06DDb");
        });
        asserts_1.assertThrows(() => {
            mod_2.saslprep("a\uE000b");
        });
        asserts_1.assertThrows(() => {
            mod_2.saslprep(`a${chr(0x1fffe)}b`);
        });
        asserts_1.assertThrows(() => {
            mod_2.saslprep("a\uD800b");
        });
        asserts_1.assertThrows(() => {
            mod_2.saslprep("a\uFFF9b");
        });
        asserts_1.assertThrows(() => {
            mod_2.saslprep("a\u2FF0b");
        });
        asserts_1.assertThrows(() => {
            mod_2.saslprep("a\u200Eb");
        });
        asserts_1.assertThrows(() => {
            mod_2.saslprep(`a${chr(0xe0001)}b`);
        });
    }
});
mod_1.test({
    name: "should not containt RandALCat and LCat bidi",
    fn() {
        asserts_1.assertThrows(() => {
            mod_2.saslprep("a\u06DD\u00AAb");
        });
    }
});
mod_1.test({
    name: "RandALCat should be first and last",
    fn() {
        mod_2.saslprep("\u0627\u0031\u0628");
        asserts_1.assertThrows(() => {
            mod_2.saslprep("\u0627\u0031");
        });
    }
});
mod_1.test({
    name: "should handle unassigned code points",
    fn() {
        mod_2.saslprep("a\u0487", { allowUnassigned: true });
        asserts_1.assertThrows(() => {
            mod_2.saslprep("a\u0487");
        });
    }
});
mod_1.runIfMain(import.meta, { parallel: true });
//# sourceMappingURL=test.js.map