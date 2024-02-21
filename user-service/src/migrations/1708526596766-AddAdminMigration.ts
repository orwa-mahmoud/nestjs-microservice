import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRoles, UserStatuses } from '../users/enums/user.enum';

export class AddAdminMigration1708526596766 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminEmail = 'admin@admin.com';
    const adminPassword = 'admin12345'; // Ensure this is hashed
    const hashedPassword = await bcrypt.hash(adminPassword, 12); // Implement this

    await queryRunner.query(`
      INSERT INTO "user" ("firstName", "lastName", "email", "password", "status", "role", "createdAt", "updatedAt")
      VALUES ('Admin', 'User', '${adminEmail}', '${hashedPassword}', '${UserStatuses.VERIFIED}', '${UserRoles.ADMIN}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "user" WHERE email = 'admin@admin.com'
    `);
  }
}
