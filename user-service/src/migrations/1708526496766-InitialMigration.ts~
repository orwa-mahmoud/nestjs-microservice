import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1708526496766 implements MigrationInterface {
    name = 'InitialMigration1708526496766'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('UN_VERIFIED', 'VERIFIED', 'DISABLED')`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying, "lastName" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "status" "public"."user_status_enum" NOT NULL DEFAULT 'UN_VERIFIED', "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER', "verifiedToken" character varying, "verifiedTokenExpiresAt" TIMESTAMP, "lastVerificationEmailSentAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "blacklist" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_491806708ff1601fd3ccb2e4101" UNIQUE ("token"), CONSTRAINT "PK_04dc42a96bf0914cda31b579702" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_491806708ff1601fd3ccb2e410" ON "blacklist" ("token") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_491806708ff1601fd3ccb2e410"`);
        await queryRunner.query(`DROP TABLE "blacklist"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
    }

}
