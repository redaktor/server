"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const permission_seed_1 = require("./permission.seed");
const ID_PERMISSION = new Map();
permission_seed_1.PERMISSIONS.map((o) => ID_PERMISSION.set(o.name, o));
exports.ROLES = [
    [
        `Owner`,
        `The unique User assigned the Owner trust can do everything on the site.`,
        [`*`]
    ], [
        `Moderator`,
        `Moderators can restrict the 'Authenticated' trust.`,
        [
            `Accept`, `Add`, `Announce`, `BlockGlobal`, `Block`, `Create`,
            `Delete`, `Flag`, `Follow`, `Ignore`, `Invite`, `Join`, `Like`,
            `Move`, `Offer`, `Question`, `Read`, `Remove`, `Update`,
            `DM`, `Push`, `Reply`, `Upload`
        ]
    ]
].map((a) => {
    const B = 'https://redaktor.me/role/';
    const [name, en, tagArr] = a;
    const o = {
        id: `${B}${name}`,
        name,
        contentMap: { en },
        permissions: tagArr.map((tag) => ID_PERMISSION.get(tag))
    };
    return o;
});
//# sourceMappingURL=role.seed.js.map