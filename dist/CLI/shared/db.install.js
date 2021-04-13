"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
function getDBprompts(config, preferences) {
    const nameBased = [`database`, `dbName`, `redaktor`];
    const pathBased = [`database`, `dbPath`];
    const schema = [`schema`, `dbSchema`, `public`];
    const _db = (p) => [
        [`host`, `dbHost`, `localhost`],
        [`port`, `dbPort`, p],
        nameBased,
        [`username`, `dbUser`, config.userName],
        [`password`, `dbPass`]
    ];
    const dbTypes = {
        sqlite: [pathBased.concat([path.join(config.home, '@redaktor.sqlite')])],
        mariadb: [..._db(3306)],
        mysql: [..._db(3306)],
        postgres: [..._db(5432), schema],
    };
    for (let key in dbTypes) {
        dbTypes[key] = dbTypes[key].map((a) => {
            const type = a[0] === 'password' ? a[0] : 'input';
            const o = { type, name: a[0], message: a[1] };
            if (preferences) {
                o.default = preferences[key];
            }
            else if (a.length > 2) {
                o.default = a[2];
                o.validate = (v) => (typeof o.default === typeof v);
            }
            return o;
        });
    }
    return dbTypes;
}
exports.default = getDBprompts;
//# sourceMappingURL=db.install.js.map