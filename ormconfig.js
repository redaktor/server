const STD_PORT = {
  mysql: 3306,
  mariadb: 3306,
  postgres: 5432,
  oracle: 1521,
  mssql: 1433,
  mongodb: 27017
}
const DB = JSON.parse(process.env.DB||'{}');
if (!!DB.type && !DB.port && !!STD_PORT[DB.type]) {
  DB.PORT = STD_PORT[DB.type];
}

module.exports = {

  /*
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "test",
  password: "...",
  database: "test",

  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "...",
  database: "redaktor",
  entities: ['dist/**  /**.entity{.ts,.js}'],
  synchronize: true,
  logging: true */

  entities: ['dist/**/**.entity{.ts,.js}'],
  synchronize: true,
  //migrationsRun: true,

  //logging: log,
  migrations: [
    __dirname + '/dist/migrations/*{.ts,.js}',
  ],
  cli: { migrationsDir: __dirname + '/src/migrations' },
  logging: true,
  type: `sqlite`,
  database: `./data.sqlite`

}
