"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tagset_1 = require("./tagset");
exports.suffixes = [
    null,
    null,
    { ea: tagset_1.SI, ia: tagset_1.NN, ic: tagset_1.ADJ, "'n": tagset_1.VB, "'t": tagset_1.VB },
    { que: tagset_1.ADJ, lar: tagset_1.ADJ, ike: tagset_1.ADJ, ffy: tagset_1.ADJ, rmy: tagset_1.ADJ, azy: tagset_1.ADJ, oid: tagset_1.ADJ, mum: tagset_1.ADJ,
        ean: tagset_1.ADJ, ous: tagset_1.ADJ, end: tagset_1.VB, sis: tagset_1.SI, rol: tagset_1.SI, ize: tagset_1.INF, ify: tagset_1.INF, zes: tagset_1.PR,
        nes: tagset_1.PR, ing: 'Gerund',
        ' so': tagset_1.ADV, "'ll": tagset_1.MD, "'re": tagset_1.CP },
    { teen: 'Value', tors: tagset_1.NN, ends: tagset_1.VB, oses: tagset_1.PR, fies: tagset_1.PR, ects: tagset_1.PR, nded: tagset_1.PA,
        cede: tagset_1.INF, tage: tagset_1.INF, gate: tagset_1.INF, vice: tagset_1.SI, tion: tagset_1.SI, ette: tagset_1.SI, some: tagset_1.ADJ,
        llen: tagset_1.ADJ, ried: tagset_1.ADJ, gone: tagset_1.ADJ, made: tagset_1.ADJ, fore: tagset_1.ADV, less: tagset_1.ADV, ices: tagset_1.PL,
        ions: tagset_1.PL, ints: tagset_1.PL, aped: tagset_1.PA, lked: tagset_1.PA, ould: tagset_1.MD, tive: tagset_1.AC,
        sson: tagset_1.LN, czyk: tagset_1.LN, chuk: tagset_1.LN, enko: tagset_1.LN, akis: tagset_1.LN, nsen: tagset_1.LN },
    { fully: tagset_1.ADV, where: tagset_1.ADV, wards: tagset_1.ADV, urned: tagset_1.PA, tized: tagset_1.PA, eased: tagset_1.PA, ances: tagset_1.PL,
        tures: tagset_1.PL, ports: tagset_1.PL, ettes: tagset_1.PL, ities: tagset_1.PL, rough: tagset_1.ADJ, bound: tagset_1.ADJ,
        tieth: 'Ordinal', ishes: tagset_1.PR, tches: tagset_1.PR, nssen: tagset_1.LN, marek: tagset_1.LN },
    { keeper: tagset_1.AC, logist: tagset_1.AC, auskas: tagset_1.LN, teenth: 'Value' },
    { sdottir: tagset_1.LN, opoulos: tagset_1.LN }
];
exports.suffixPOS = {
    a: [[/.[aeiou]na$/, tagset_1.NN], [/.[oau][wvl]ska$/, tagset_1.LN], [/.[^aeiou]ica$/, tagset_1.SI],
        [/^([hyj]a)+$/, tagset_1.EXP]],
    c: [[/.[^aeiou]ic$/, tagset_1.ADJ]],
    d: [[/.[ia]sed$/, tagset_1.ADJ], [/.[gt]led$/, tagset_1.ADJ], [/.[aeiou][td]ed$/, tagset_1.PA], [/[^aeiou]ard$/, tagset_1.SI],
        [/[aeiou][^aeiou]id$/, tagset_1.ADJ], [/[aeiou]c?ked$/, tagset_1.PA], [/.[vrl]id$/, tagset_1.ADJ]],
    e: [[/.[lnr]ize$/, tagset_1.INF], [/.[^aeiou]ise$/, tagset_1.INF], [/.[aeiou]te$/, tagset_1.INF],
        [/.[^aeiou][ai]ble$/, tagset_1.ADJ], [/.[^aeiou]eable$/, tagset_1.ADJ], [/.[^aeiou]ive$/, tagset_1.ADJ]],
    h: [[/.[^aeiouf]ish$/, tagset_1.ADJ], [/.v[iy]ch$/, tagset_1.LN], [/^ug?h+$/, tagset_1.EXP],
        [/^uh[ -]?oh$/, tagset_1.EXP]],
    i: [[/.[oau][wvl]ski$/, tagset_1.LN]],
    k: [[/^(k)+$/, tagset_1.EXP]],
    l: [[/.[nrtumcd]al$/, tagset_1.ADJ], [/.[gl]ial$/, tagset_1.ADJ], [/.[^aeiou]eal$/, tagset_1.ADJ],
        [/.[^aeiou][ei]al$/, tagset_1.ADJ], [/.[^aeiou]ful$/, tagset_1.ADJ]],
    m: [[/.[^aeiou]ium$/, tagset_1.SI], [/[^aeiou]ism$/, tagset_1.SI], [/.[^aeiou]ium$/, tagset_1.SI],
        [/^mmm+$/, tagset_1.EXP], [/^[hu]m+$/, tagset_1.EXP], [/^[0-9]+ ?(am|pm)$/, 'Date']],
    n: [[/.[lsrnpb]ian$/, tagset_1.ADJ], [/[^aeiou]ician$/, tagset_1.AC]],
    o: [[/^no+$/, tagset_1.EXP], [/^(yo)+$/, tagset_1.EXP], [/^woo+[pt]?$/, tagset_1.EXP]],
    r: [[/.[ilk]er$/, 'Comparative'], [/[aeiou][pns]er$/, tagset_1.SI], [/[^i]fer$/, tagset_1.INF],
        [/.[^aeiou][ao]pher$/, tagset_1.AC]],
    t: [[/.[di]est$/, 'Superlative'], [/.[icldtgrv]ent$/, tagset_1.ADJ], [/[aeiou].*ist$/, tagset_1.ADJ],
        [/^[a-z]et$/, tagset_1.VB]],
    s: [[/.[rln]ates$/, tagset_1.PR], [/.[^z]ens$/, tagset_1.VB], [/.[lstrn]us$/, tagset_1.SI],
        [/[aeiou][^aeiou]is$/, tagset_1.SI], [/[a-z]\'s$/, tagset_1.NN], [/^yes+$/, tagset_1.EXP]],
    v: [[/.[^aeiou][ai][kln]ov$/, tagset_1.LN]],
    y: [[/.[cts]hy$/, tagset_1.ADJ], [/.[st]ty$/, tagset_1.ADJ], [/.[gk]y$/, tagset_1.ADJ], [/.[tnl]ary$/, tagset_1.ADJ],
        [/.[oe]ry$/, tagset_1.SI], [/[rdntkbhs]ly$/, tagset_1.ADV], [/[bszmp]{2}y$/, tagset_1.ADJ],
        [/.(gg|bb|zz)ly$/, tagset_1.ADJ], [/.[aeiou]my$/, tagset_1.ADJ], [/.[^aeiou]ity$/, tagset_1.SI],
        [/[ea]{2}zy$/, tagset_1.ADJ], [/.[^aeiou]ity$/, tagset_1.SI]]
};
//# sourceMappingURL=suffixes.js.map