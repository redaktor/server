// Type definitions for node-forge 0.9.1
// Project: https://github.com/digitalbazaar/forge
// Definitions by: Seth Westphal    <https://github.com/westy92>
//                 Kay Schecker     <https://github.com/flynetworks>
//                 Aakash Goenka    <https://github.com/a-k-g>
//                 Rafal2228        <https://github.com/rafal2228>
//                 Beeno Tung       <https://github.com/beenotung>
//                 Joe Flateau      <https://github.com/joeflateau>
//                 Nikita Koryabkin <https://github.com/Apologiz>
//                 timhwang21       <https://github.com/timhwang21>
//                 supaiku0         <https://github.com/supaiku0>
//                 Anders Kaseorg   <https://github.com/andersk>
//                 Sascha Zarhuber  <https://github.com/saschazar21>
//                 Rogier Schouten  <https://github.com/rogierschouten>
//                 Ivan Aseev       <https://github.com/aseevia>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.6

/// <reference types="node" />

declare module "forge" {
    type Byte = number;
    type Bytes = string;
    type Hex = string;
    type Base64 = string;
    type Utf8 = string;
    type OID = string;
    type Encoding = "raw" | "utf8";

    namespace random {
        function getBytes(count: number, callback?: (bytes: Bytes) => any): Bytes;
        function getBytesSync(count: number): Bytes;
        type CB = (_: any, seed: string) => void;
        interface Random {
            seedFileSync: (needed: number) => string;
            seedFile: (needed: number, cb: CB) => void;
        }
        function createInstance(): Random;
    }

    namespace asn1 {
        enum Class {
            UNIVERSAL = 0x00,
            APPLICATION = 0x40,
            CONTEXT_SPECIFIC = 0x80,
            PRIVATE = 0xC0,
        }

        enum Type {
            NONE = 0,
            BOOLEAN = 1,
            INTEGER = 2,
            BITSTRING = 3,
            OCTETSTRING = 4,
            NULL = 5,
            OID = 6,
            ODESC = 7,
            EXTERNAL = 8,
            REAL = 9,
            ENUMERATED = 10,
            EMBEDDED = 11,
            UTF8 = 12,
            ROID = 13,
            SEQUENCE = 16,
            SET = 17,
            PRINTABLESTRING = 19,
            IA5STRING = 22,
            UTCTIME = 23,
            GENERALIZEDTIME = 24,
            BMPSTRING = 30,
        }

        interface Asn1 {
            tagClass: Class;
            type: Type;
            constructed: boolean;
            composed: boolean;
            value: Bytes | Asn1[];
        }

        function create(tagClass: Class, type: Type, constructed: boolean, value: Bytes | Asn1[]): Asn1;
        function fromDer(bytes: Bytes | util.ByteBuffer, strict?: boolean): Asn1;
        function toDer(obj: Asn1): util.ByteBuffer;
        function oidToDer(oid: OID): util.ByteStringBuffer;
        function derToOid(der: util.ByteStringBuffer): OID;
    }

    namespace util {
        function isArray(x: any): boolean;
        function isArrayBuffer(x: any): boolean;
        function isArrayBufferView(x: any): boolean;

        interface ArrayBufferView {
            buffer: ArrayBuffer;
            byteLength: number;
        }

        type ByteBuffer = ByteStringBuffer;
        class ByteStringBuffer {
            constructor(bytes?: Bytes | ArrayBuffer | ArrayBufferView | ByteStringBuffer);
            data: string;
            read: number;
            length(): number;
            isEmpty(): boolean;
            putByte(byte: Byte): ByteStringBuffer;
            fillWithByte(byte: Byte, n: number): ByteStringBuffer;
            putBytes(bytes: Bytes): ByteStringBuffer;
            putString(str: string): ByteStringBuffer;
            putInt16(int: number): ByteStringBuffer;
            putInt24(int: number): ByteStringBuffer;
            putInt32(int: number): ByteStringBuffer;
            putInt16Le(int: number): ByteStringBuffer;
            putInt24Le(int: number): ByteStringBuffer;
            putInt32Le(int: number): ByteStringBuffer;
            putInt(int: number, numOfBits: number): ByteStringBuffer;
            putSignedInt(int: number, numOfBits: number): ByteStringBuffer;
            putBuffer(buffer: ByteStringBuffer): ByteStringBuffer;
            getByte(): number;
            getInt16(): number;
            getInt24(): number;
            getInt32(): number;
            getInt16Le(): number;
            getInt24Le(): number;
            getInt32Le(): number;
            getInt(numOfBits: number): number;
            getSignedInt(numOfBits: number): number;
            getBytes(count?: number): Bytes;
            bytes(count?: number): Bytes;
            at(index: number): Byte;
            setAt(index: number, byte: number): ByteStringBuffer;
            last(): Byte;
            copy(): ByteStringBuffer;
            compact(): ByteStringBuffer;
            clear(): ByteStringBuffer;
            truncate(): ByteStringBuffer;
            toHex(): Hex;
            toString(): string;
        }

        function fillString(char: string, count: number): string;
        function xorBytes(bytes1: string, bytes2: string, count: number): string;
        function hexToBytes(hex: Hex): Bytes;
        function bytesToHex(bytes: Bytes): Hex;
        function int32ToBytes(int: number): Bytes;
        function encode64(bytes: Bytes, maxline?: number): Base64;
        function decode64(encoded: Base64): Bytes;
        function encodeUtf8(str: string): Utf8;
        function decodeUtf8(encoded: Utf8): string;

        function createBuffer(): ByteBuffer;
        function createBuffer(input: Bytes | ArrayBuffer | ArrayBufferView | ByteStringBuffer, encoding?: Encoding): ByteBuffer;

        namespace binary {
            namespace raw {
                function encode(x: Uint8Array): Bytes;
                function decode(str: Bytes, output?: Uint8Array, offset?: number): Uint8Array;
            }
            namespace hex {
                function encode(bytes: Bytes | ArrayBuffer | ArrayBufferView | ByteStringBuffer): Hex;
                function decode(hex: Hex, output?: Uint8Array, offset?: number): Uint8Array;
            }
            namespace base64 {
                function encode(input: Uint8Array, maxline?: number): Base64;
                function decode(input: Base64, output?: Uint8Array, offset?: number): Uint8Array;
            }
        }

        namespace text {
            namespace utf8 {
                function encode(str: string, output?: Uint8Array, offset?: number): Uint8Array;
                function decode(bytes: Uint8Array): Utf8;
            }
            namespace utf16 {
                function encode(str: string, output?: Uint8Array, offset?: number): Uint8Array;
                function decode(bytes: Uint8Array): string;
            }
        }
    }

    namespace md {

        interface MessageDigest {
            update(msg: string, encoding?: Encoding): MessageDigest;
            digest(): util.ByteStringBuffer;
        }

        namespace sha1 {
            function create(): MessageDigest;
        }

        namespace sha256 {
            function create(): MessageDigest;
        }

        namespace sha384 {
            function create(): MessageDigest;
        }

        namespace sha512 {
            function create(): MessageDigest;
        }

        namespace md5 {
            function create(): MessageDigest;
        }

        namespace hmac {
        }
    }

    namespace hmac {

      type Algorithm = "sha1" | "md5" | "sha256";

      interface HMAC {
          digest(): util.ByteBuffer;
          getMact(): util.ByteBuffer;
          start(md: Algorithm, key: string | util.ByteBuffer | null): void;
          update(bytes: string | util.ByteBuffer | Buffer): void;
      }

      function create(): HMAC;
    }

    namespace cipher {

        type Algorithm = "AES-ECB" | "AES-CBC" | "AES-CFB" | "AES-OFB" | "AES-CTR" | "AES-GCM" | "3DES-ECB" | "3DES-CBC" | "DES-ECB" | "DES-CBC";

        function createCipher(algorithm: Algorithm, payload: util.ByteBuffer | Bytes): BlockCipher;
        function createDecipher(algorithm: Algorithm, payload: util.ByteBuffer | Bytes): BlockCipher;

        interface StartOptions {
            iv?: util.ByteBuffer | Byte[] | Bytes;
            tag?: util.ByteStringBuffer;
            tagLength?: number;
            additionalData?: string;
        }

        interface BlockCipher {
            start: (options?: StartOptions) => void;
            update: (payload: util.ByteBuffer) => void;
            finish: () => boolean;
            output: util.ByteStringBuffer;
            mode: Mode;
        }

        interface Mode {
            tag: util.ByteStringBuffer;
        }
    }

    namespace pss {
        type PSS = any;

        function create(any: any): PSS;
    }

    namespace mgf {
        namespace mgf1 {
            function create(any: any): any;
        }
    }
}
