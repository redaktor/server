"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDBprompts(userName, preferences) {
    const name = [`database`, `dbName`, `redaktor`];
    const path = [`database`, `dbPath`];
    const schema = [`schema`, `dbSchema`, `public`];
    const _db = (p) => [
        [`host`, `dbHost`, `localhost`],
        [`port`, `dbPort`, p],
        name,
        [`username`, `dbUser`, userName],
        [`password`, `dbPass`]
    ];
    const dbTypes = {
        mariadb: [..._db(3306)],
        mysql: [..._db(3306)],
        sqlite: [path],
        postgres: [..._db(5432), schema],
        mongodb: [..._db(27017)],
        mssql: [..._db(1433), schema],
        cordova: [name, path],
        nativescript: [name],
        'react-native': [name, path]
    };
    for (let key in dbTypes) {
        dbTypes[key] = dbTypes[key].map((a) => {
            const type = a[0] === 'password' ? a[0] : 'input';
            const o = { type, name: a[0], message: a[1] };
            if (preferences) {
                o.default = preferences[a[0]];
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