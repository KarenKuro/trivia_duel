import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMatchEntitiy1722447117304 implements MigrationInterface {
    name = 'AddMatchEntitiy1722447117304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`coins\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`premiumCoins\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`subscription\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`level\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`points\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`lives\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`status\` enum ('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`coins\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`premiumCoins\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`subscription\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`level\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`points\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`lives\` int NOT NULL DEFAULT '5'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`lives\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`points\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`level\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`subscription\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`premiumCoins\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`coins\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`lives\` int NOT NULL DEFAULT '5'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`points\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`level\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`subscription\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`premiumCoins\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`coins\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`status\` enum ('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

}
