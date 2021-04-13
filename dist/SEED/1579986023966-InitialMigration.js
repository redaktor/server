"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const permission_seed_1 = require("../SEED/permission.seed");
class InitialMigration1579986023966 {
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE 'permission' ('uid' integer PRIMARY KEY AUTOINCREMENT NOT NULL, 'published' datetime NOT NULL DEFAULT (datetime('now')), 'updated' datetime NOT NULL DEFAULT (datetime('now')), 'id' varchar NOT NULL, 'name' varchar NOT NULL, 'enabled' boolean NOT NULL DEFAULT (1), 'nsleft' integer NOT NULL DEFAULT (1), 'nsright' integer NOT NULL DEFAULT (2), 'parentUid' integer)`);
        await queryRunner.query(`CREATE UNIQUE INDEX 'IDX_3b8b97af9d9d8807e41e6f4836' ON 'permission' ('id') `);
        await queryRunner.query(`CREATE TABLE 'role' ('uid' integer PRIMARY KEY AUTOINCREMENT NOT NULL, 'published' datetime NOT NULL DEFAULT (datetime('now')), 'updated' datetime NOT NULL DEFAULT (datetime('now')), 'id' varchar NOT NULL, 'name' varchar NOT NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX 'IDX_b36bcfe02fc8de3c57a8b2391c' ON 'role' ('id') `);
        await queryRunner.query(`CREATE TABLE 'temporary_type' ('uid' integer PRIMARY KEY AUTOINCREMENT NOT NULL, 'text' varchar NOT NULL DEFAULT ('Create'), 'isCore' boolean NOT NULL DEFAULT (0), 'generator' varchar NOT NULL DEFAULT ('redaktor'))`);
        await queryRunner.query(`INSERT INTO 'temporary_type'('uid', 'text', 'isCore', 'generator') SELECT 'uid', 'text', 'isCore', 'generator' FROM 'type'`);
        await queryRunner.query(`DROP TABLE 'type'`);
        await queryRunner.query(`ALTER TABLE 'temporary_type' RENAME TO 'type'`);
        await queryRunner.query(`CREATE TABLE 'temporary_type' ('uid' integer PRIMARY KEY AUTOINCREMENT NOT NULL, 'text' varchar NOT NULL DEFAULT ('Create'), 'isCore' boolean NOT NULL DEFAULT (0), 'generator' varchar NOT NULL DEFAULT ('redaktor'), 'isActor' boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO 'temporary_type'('uid', 'text', 'isCore', 'generator') SELECT 'uid', 'text', 'isCore', 'generator' FROM 'type'`);
        await queryRunner.query(`DROP TABLE 'type'`);
        await queryRunner.query(`ALTER TABLE 'temporary_type' RENAME TO 'type'`);
        await queryRunner.query(`DROP INDEX 'IDX_3b8b97af9d9d8807e41e6f4836'`);
        await queryRunner.query(`CREATE TABLE 'temporary_permission' ('uid' integer PRIMARY KEY AUTOINCREMENT NOT NULL, 'published' datetime NOT NULL DEFAULT (datetime('now')), 'updated' datetime NOT NULL DEFAULT (datetime('now')), 'id' varchar NOT NULL, 'name' varchar NOT NULL, 'enabled' boolean NOT NULL DEFAULT (1), 'nsleft' integer NOT NULL DEFAULT (1), 'nsright' integer NOT NULL DEFAULT (2), 'parentUid' integer, CONSTRAINT 'FK_4a9636ea64e8426e887fee842b2' FOREIGN KEY ('parentUid') REFERENCES 'permission' ('uid') ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO 'temporary_permission'('uid', 'published', 'updated', 'id', 'name', 'enabled', 'nsleft', 'nsright', 'parentUid') SELECT 'uid', 'published', 'updated', 'id', 'name', 'enabled', 'nsleft', 'nsright', 'parentUid' FROM 'permission'`);
        await queryRunner.query(`DROP TABLE 'permission'`);
        await queryRunner.query(`ALTER TABLE 'temporary_permission' RENAME TO 'permission'`);
        await queryRunner.query(`CREATE UNIQUE INDEX 'IDX_3b8b97af9d9d8807e41e6f4836' ON 'permission' ('id') `);
        await typeorm_1.getRepository('permission').save(permission_seed_1.PERMISSIONS);
        await typeorm_1.getRepository('roles').save(permission_seed_1.ROLES);
    }
    async down(queryRunner) {
    }
}
exports.InitialMigration1579986023966 = InitialMigration1579986023966;
//# sourceMappingURL=1579986023966-InitialMigration.js.map