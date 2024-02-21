import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1708535768107 implements MigrationInterface {
    name = 'InitialMigration1708535768107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "creatorId" integer NOT NULL, "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "quantity" integer NOT NULL DEFAULT '0', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
