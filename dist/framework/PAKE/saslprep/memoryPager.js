"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function grow(pager, index) {
    while (pager.maxPages < index) {
        const old = pager.pages;
        pager.pages = new Array(32768);
        pager.pages[0] = old;
        pager.level++;
        pager.maxPages *= 32768;
    }
}
function truncate(buf, len) {
    if (buf.length === len) {
        return buf;
    }
    if (buf.length > len) {
        return buf.slice(0, len);
    }
    const cpy = new Uint8Array(len);
    cpy.set(buf, 0);
    return cpy;
}
function concat(bufs) {
    const total = bufs.reduce((acc, cur) => acc + cur.byteLength, 0);
    const buf = new Uint8Array(total);
    let offset = 0;
    for (const b of bufs) {
        buf.set(b, offset);
        offset += b.byteLength;
    }
    return buf;
}
function equal(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((x, i) => x === b[i]);
}
function factor(n, out) {
    n = (n - (out[0] = n & 32767)) / 32768;
    n = (n - (out[1] = n & 32767)) / 32768;
    out[3] = ((n - (out[2] = n & 32767)) / 32768) & 32767;
}
function copy(buf) {
    const cpy = new Uint8Array(buf.length);
    cpy.set(buf, 0);
    return cpy;
}
class Page {
    constructor(i, buf) {
        this.offset = i * buf.length;
        this.buffer = buf;
        this.updated = false;
        this.deduplicate = 0;
    }
}
exports.Page = Page;
class Pager {
    constructor(pageSize, opts = {}) {
        this.maxPages = 32768;
        this.pages = new Array(32768);
        this.length = 0;
        this.level = 0;
        this.updates = [];
        this.path = new Uint16Array(4);
        this.pageSize = pageSize;
        this.deduplicate = opts.deduplicate || null;
        this.zeros = this.deduplicate
            ? new Uint8Array(this.deduplicate.length)
            : null;
    }
    updated(page) {
        while (this.deduplicate &&
            page.buffer[page.deduplicate] === this.deduplicate[page.deduplicate]) {
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
    lastUpdate() {
        if (!this.updates || !this.updates.length) {
            return null;
        }
        const page = this.updates.pop();
        page.updated = false;
        return page;
    }
    get(i, noAllocate) {
        const arr = this._array(i, noAllocate);
        const first = this.path[0];
        let page = arr && arr[first];
        if (!page && !noAllocate) {
            page = arr[first] = new Page(i, new Uint8Array(this.pageSize));
            if (i >= this.length) {
                this.length = i + 1;
            }
        }
        if (page &&
            page.buffer === this.deduplicate &&
            this.deduplicate &&
            !noAllocate) {
            page.buffer = copy(page.buffer);
            page.deduplicate = 0;
        }
        return page;
    }
    set(i, buf) {
        const arr = this._array(i, false);
        const first = this.path[0];
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
        const page = arr[first];
        const b = truncate(buf, this.pageSize);
        if (page) {
            page.buffer = b;
        }
        else {
            arr[first] = new Page(i, b);
        }
    }
    toBuffer() {
        const list = new Array(this.length);
        const empty = new Uint8Array(this.pageSize);
        let ptr = 0;
        while (ptr < list.length) {
            const arr = this._array(ptr, true);
            for (let i = 0; i < 32768 && ptr < list.length; i++) {
                list[ptr++] = arr && arr[i] ? arr[i].buffer : empty;
            }
        }
        return concat(list);
    }
    _array(i, noAllocate) {
        if (i >= this.maxPages) {
            if (noAllocate) {
                return;
            }
            grow(this, i);
        }
        factor(i, this.path);
        let arr = this.pages;
        for (let j = this.level; j > 0; j--) {
            const p = this.path[j];
            let next = arr[p];
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
exports.Pager = Pager;
//# sourceMappingURL=memoryPager.js.map