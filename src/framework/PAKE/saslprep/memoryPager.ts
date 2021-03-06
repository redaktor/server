/*
The MIT License (MIT)

Original work Copyright (c) 2016 Mathias Buus
Deno port Copyright (c) 2019 Noah Anabiik Schwarz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/** Grows a pager. */
function grow(pager: Pager, index: number): void {
  while (pager.maxPages < index) {
    const old: any = pager.pages;
    pager.pages = new Array(32768);
    pager.pages[0] = old;
    pager.level++;
    pager.maxPages *= 32768;
  }
}

/** Truncates the input buffer. */
function truncate(buf: Uint8Array, len: number): Uint8Array {
  if (buf.length === len) {
    return buf;
  }

  if (buf.length > len) {
    return buf.slice(0, len);
  }

  const cpy: Uint8Array = new Uint8Array(len);
  cpy.set(buf, 0);

  return cpy;
}

/** Concatenates given buffers. */
function concat(bufs: Uint8Array[]): Uint8Array {
  const total: number = bufs.reduce(
    (acc, cur): number => acc + cur.byteLength,
    0
  );

  const buf: Uint8Array = new Uint8Array(total);
  let offset: number = 0;

  for (const b of bufs) {
    buf.set(b, offset);
    offset += b.byteLength;
  }

  return buf;
}

/** Compares two buffers. */
function equal(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((x: number, i: number): boolean => x === b[i]);
}

/** Factors something? */
function factor(n: number, out: Uint16Array): void {
  n = (n - (out[0] = n & 32767)) / 32768;
  n = (n - (out[1] = n & 32767)) / 32768;
  out[3] = ((n - (out[2] = n & 32767)) / 32768) & 32767;
}

/** Copies a buffer. */
function copy(buf: Uint8Array): Uint8Array {
  const cpy: Uint8Array = new Uint8Array(buf.length);
  cpy.set(buf, 0);
  return cpy;
}

/** A class representation of a page. */
export class Page {
  offset: number;
  buffer: Uint8Array;
  updated: boolean;
  deduplicate: number;

  constructor(i: number, buf: Uint8Array) {
    this.offset = i * buf.length;
    this.buffer = buf;
    this.updated = false;
    this.deduplicate = 0;
  }
}

/** Pager constructor options. */
export interface PagerOptions {
  deduplicate?: Uint8Array;
}

/** A class representation of a pager. */
export class Pager {
  readonly pageSize: number;

  maxPages: number = 32768;
  pages: Page[] = new Array(32768);
  length: number = 0;
  level: number = 0;

  private updates: Page[] = [];
  private path: Uint16Array = new Uint16Array(4);
  private deduplicate: Uint8Array;
  private zeros: Uint8Array;

  constructor(pageSize: number, opts: PagerOptions = {}) {
    this.pageSize = pageSize;
    this.deduplicate = opts.deduplicate || null;
    this.zeros = this.deduplicate
      ? new Uint8Array(this.deduplicate.length)
      : null;
  }

  updated(page: Page): void {
    while (
      this.deduplicate &&
      page.buffer[page.deduplicate] === this.deduplicate[page.deduplicate]
    ) {
      if (++page.deduplicate === this.deduplicate.length) {
        page.deduplicate = 0;

        if (equal(page.buffer, this.deduplicate)) {
          page.buffer = this.deduplicate;
        }

        break;
      }
    }

    if (page.updated || !this.updates) {
      return;
    }

    page.updated = true;
    this.updates.push(page);
  }

  lastUpdate(): Page {
    if (!this.updates || !this.updates.length) {
      return null;
    }

    const page: Page = this.updates.pop();
    page.updated = false;
    return page;
  }

  get(i: number, noAllocate?: boolean): Page {
    const arr = this._array(i, noAllocate);
    const first: number = this.path[0];
    let page: Page = arr && arr[first];
    if (!page && !noAllocate) {
      page = arr[first] = new Page(i, new Uint8Array(this.pageSize));
      if (i >= this.length) {
        this.length = i + 1;
      }
    }

    if (
      page &&
      page.buffer === this.deduplicate &&
      this.deduplicate &&
      !noAllocate
    ) {
      page.buffer = copy(page.buffer);
      page.deduplicate = 0;
    }

    return page;
  }

  set(i: number, buf: Uint8Array): void {
    const arr: Page[] = this._array(i, false);
    const first: number = this.path[0];

    if (i >= this.length) {
      this.length = i + 1;
    }

    if (!buf || (this.zeros && equal(buf, this.zeros))) {
      arr[first] = undefined;
      return;
    }

    if (this.deduplicate && equal(buf, this.deduplicate)) {
      buf = this.deduplicate;
    }

    const page: Page = arr[first];
    const b: Uint8Array = truncate(buf, this.pageSize);

    if (page) {
      page.buffer = b;
    } else {
      arr[first] = new Page(i, b);
    }
  }

  /** Concat all allocated pages into a single buffer. */
  toBuffer(): Uint8Array {
    const list: Uint8Array[] = new Array(this.length);
    const empty: Uint8Array = new Uint8Array(this.pageSize);
    let ptr: number = 0;

    while (ptr < list.length) {
      const arr: Page[] = this._array(ptr, true);

      for (let i: number = 0; i < 32768 && ptr < list.length; i++) {
        list[ptr++] = arr && arr[i] ? arr[i].buffer : empty;
      }
    }

    return concat(list);
  }

  private _array(i: number, noAllocate: boolean): Page[] {
    if (i >= this.maxPages) {
      if (noAllocate) {
        return;
      }

      grow(this, i);
    }

    factor(i, this.path);
    let arr: any[] = this.pages;

    for (let j: number = this.level; j > 0; j--) {
      const p: number = this.path[j];
      let next: any = arr[p];

      if (!next) {
        if (noAllocate) {
          return;
        }

        next = arr[p] = new Array(32768);
      }

      arr = next;
    }

    return arr;
  }
}
