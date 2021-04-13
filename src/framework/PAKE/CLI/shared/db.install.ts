import * as path from 'path';
import * as inquirer from 'inquirer';
import { RedaktorConfig } from '../Command';

export default function getDBprompts(config: RedaktorConfig, preferences?: any): {[key: string]: inquirer.Question[]} {
  // nameBased, message, default?, transformer?
  const nameBased = [`database`, `dbName`, `redaktor`];
  const pathBased = [`database`, `dbPath`];
  const schema = [`schema`, `dbSchema`, `public`];
  const _db = (p: number) => [
    [`host`, `dbHost`, `localhost`],
    [`port`, `dbPort`, p],
    nameBased,
    [`username`, `dbUser`, config.userName],
    [`password`, `dbPass`]
  ];

  const dbTypes: any = {
    // TODO pathBased , (s: string) => s.charAt(0) === '.' ? '' : s
    sqlite:   [pathBased.concat([ path.join(config.home, '@redaktor.sqlite') ])],
    mariadb:  [..._db(3306)],
    mysql:    [..._db(3306)],
    postgres: [..._db(5432), schema],
    // CHECK OUT EXPERIMENTAL SUPPORT TODO :
    // mongodb: [..._db(27017)],
    // mssql:    [..._db(1433), schema],
    // cordova:  [pathBased, pathBased],
    // nativescript: [pathBased],
    // 'react-native': [pathBased, pathBased]
  };
  for (let key in dbTypes) {
    dbTypes[key] = dbTypes[key].map((a: any[]) => {
      const type = a[0] === 'password' ? a[0] : 'input';
      const o: inquirer.Question = {type, name: a[0], message: a[1]}
      if (preferences) {
        o.default = preferences[key]
      } else if (a.length > 2) {
        o.default = a[2];
        o.validate = (v:any) => (typeof o.default === typeof v)
      }
      return o
    })
  }
  return dbTypes
}
