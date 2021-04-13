import { Question } from '../';
export default function getDBprompts(userName: string, preferences?: any): Question[] {
  const name = [`database`, `dbName`, `redaktor`];
  const path = [`database`, `dbPath`];
  const schema = [`schema`, `dbSchema`, `public`];
  const _db = (p: number) => [
    [`host`, `dbHost`, `localhost`],
    [`port`, `dbPort`, p],
    name,
    [`username`, `dbUser`, userName],
    [`password`, `dbPass`]
  ];
  const dbTypes: any = {
    mariadb:  [..._db(3306)],
    mysql:    [..._db(3306)],
    sqlite:   [path],
    postgres: [..._db(5432), schema],
    mongodb: [..._db(27017)],
    mssql:    [..._db(1433), schema],
    cordova:  [name, path],
    nativescript: [name],
    'react-native': [name, path]
  };
  for (let key in dbTypes) {
    dbTypes[key] = dbTypes[key].map((a: any[]) => {
      const type = a[0] === 'password' ? a[0] : 'input';
      const o: Question = {type, name: a[0], message: a[1]}
      if (preferences) {
        o.default = preferences[a[0]]
      } else if (a.length > 2) {
        o.default = a[2];
        o.validate = (v:any) => (typeof o.default === typeof v)
      }
      return o
    })
  }
  return dbTypes
}
