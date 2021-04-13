"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let compact = {
    '_': 'ـ',
    '!': '¡',
    '?': '¿Ɂ',
    'and': '&',
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '۸', '9': '٩',
    A: 'ĀĂĄǍǞǠǺȀȂȦȺΆΑΔΛАѦӐӒÀÁÂÃÅẠẢẤẦẨẪẬẮẰẲẴẶɅ',
    a: 'ªàáâãåāăąǎǟǡǻȁȃȧάαλаѧӑӓƛạảấầẩẫậắằẳẵặآأاى',
    ae: 'ÄäæÆ',
    B: 'ÞɃƁƂƄΒϦБЪЬѢҌҔƤ',
    b: 'ßþƀƃƅβϐϧбъьѣҍҕƥƾب',
    C: 'ÇĆĈĊČƆƇȻϽϾϿϹЄҀҪ',
    c: '¢©çćĉċčɔƈȼͻͼͽϲєҁҫ',
    Ch: 'Ч', ch: 'ч', Cz: 'Ц', cz: 'ц',
    D: 'ДÐĎĐƉƊƋǷ',
    d: 'дδðďđɖɗȡƌƿدض', dh: 'ذ',
    E: 'ÈÉÊËĒĔĖĘĚƎƏƐȄȆȨɆΈΕΞΣΡЀЕЭҼҾӖӘӚӬẸẺẼẾỀỂỄỆ',
    e: 'èéêëēĕėęěǝəɛȅȇȩɇέεξσϱϵ϶ѐеэҽҿӗәӛӭẹẻẽếềểễệءعэ',
    F: 'ФƑϜӺҒӶ',
    f: 'φƒϝӻғӷſفф',
    G: 'ГĜĞĠĢƓǤǦǴ',
    g: 'гĝğġģɠǥǧǵ', gh: 'غ',
    H: 'ХĤĦǶȞΉΗЂЊЋНҢҤҺӉ',
    h: 'хĥħƕȟήηђњћнңҥһӊحه',
    I: 'ИÌÍÎÏĨĪĬĮİIƖƗȈȊΊΪΪІЇỈỊ',
    i: 'иìíîïĩīĭįi̇ıɩɨȉȋίΐϊιіїỉịإ',
    J: 'ЙĴJ̌ɈͿĲЈ',
    j: 'йĴĵǰȷɉϳјĳج',
    K: 'ĶƘǨΚЌКҚҜҞҠ',
    k: 'ķĸƙǩκќкқҝҟҡك', kh: 'خ',
    L: 'ЛĹĻĽĿŁȽǏΙӀ',
    l: 'лĺļľŀłƚƪǀǐȴιӏل',
    M: 'ΜϺМӍ',
    m: 'μϻмӎم',
    N: 'НÑŃŅŇʼNŊƝȠǸΝΠΉΗϞЍЙҊӅӢӤ',
    n: 'нñńņňŉŋɲƞǹȵνπήηϟѝйҋӆӣӥن',
    O: 'ÒÓÔÕØÐŌŎŐƟƠǑǪǬǾȌȎȪȬȮȰΌΘΟΣΦϘϬϴОѲӦӨӪΏŒỌỎỐỒỔỖỘỚỜỞỠỢ',
    o: 'òóôõøðōŏőɵơǒǫǭǿȍȏȫȭȯȱόθοσϕϙϭоѳӧөӫ¤ƍώœọỏốồổỗộớờởỡợ',
    oe: 'Öö',
    P: 'ПƤǷΡϷҎÞ',
    p: 'пƥƿρϸϼҏþ',
    Q: 'Ɋ',
    q: 'ɋق',
    R: 'РŔŖŘƦȐȒɌЃҐر',
    r: 'рŕŗřʀȑȓɍѓґ',
    S: 'СŚŜŞŠƧȘⱾΣϚϞϨЅ',
    s: 'сśŝşšƨșȿςϛϟϩѕسص',
    Sh: 'Ш', sh: 'шش', Shh: 'Щ', shh: 'щ',
    ss: 'ßẞ',
    T: 'ŢŤŦƬƮȚȾΓΤϮТҬ',
    t: 'ţťŧƫƭʈțȶⱦγτϯт҂ҭةتط', th: 'ث',
    U: 'УΜÙÚÛŨŪŬŮŲƯƱƲǓǕǗǙǛȔȖɄΫ́ΫΎΘЏҴҶӋӇỤỦỨỪỬỮỰ',
    u: 'уµùúûũūŭůųưʊʋǔǖǘǚǜȕȗʉΰμυϋύϑџҵҷӌӈụủứừửữự',
    Ue: 'ÜŰ',
    ue: 'üű',
    V: 'ВѴѶ',
    v: 'вνѵѷ',
    W: 'ŴƜΩΏΠϢѠѾ',
    w: 'ŵɯωώϖϣѡѿؤو',
    X: 'ΧϏΚҲӼӾ',
    x: '×χϗϰҳӽӿ',
    Y: 'ÝŸŶƳȲɎΎΥΫΓΨЎѰҮҰӮӰӲỲỴỶỸЫ',
    y: 'ýÿŷƴȳɏύυϋγψϒϓϔўѱүұӯӱӳỳỵỷỹئيы',
    Ya: 'Я', ya: 'я', Yo: 'Ё', yo: 'ё', Yu: 'Ю', yu: 'ю',
    Z: 'ŹŻŽƩƵȤⱿΖЗ',
    z: 'źżžʃƶȥɀζزظз',
    Zh: 'Ж',
    zh: 'ж'
};
let unicode = {};
for (const k in compact) {
    compact[k].split('').map((s) => { unicode[s] = k; });
}
exports.default = unicode;
//# sourceMappingURL=unicode.js.map