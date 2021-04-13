"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../../../../util/string/main");
const messages = {
    _generateHcard: 'Erstelle deine h-card',
    description: 'Dokumentation',
    lead1: 'Verlinke zu deinen verschiedenen sozialen Services',
    text1: main_1._ `Erstelle auf deiner Homepage Links zu deinen Profilen mit einem <code>rel="me"</code>
    Attribut.<br/>Das könnte so aussehen:`,
    text1_2: main_1._ `Falls Du keine sichtbaren Links auf der Homepage möchtest, kannst du stattdessen
    <code>&lt;link&gt;</code> tags<br/>in deinem html header verwenden.`,
    lead2: 'Stelle sicher, daß jedes Profil zurückverlinkt',
    text2: main_1._ `Du mußt sicherstellen, daß jeder Service auch einen Link zu Deiner Homepage hat.<br/>
    Die "Profil ändern" Links für einige unterstützte Services findest Du unten.`,
    lead3: 'Und fertig!',
    text3: main_1._ `Alles klar. Jetzt kannst Du deine Domain benutzen um dich bei allen Seiten anzumelden,
    die IndieAuth unterstützen!`
};
exports.default = messages;
//# sourceMappingURL=setup.js.map