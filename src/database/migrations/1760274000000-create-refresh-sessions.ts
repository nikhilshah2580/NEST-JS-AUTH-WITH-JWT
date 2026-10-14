import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshSessions1760274000000 implements MigrationInterface {
  name = 'CreateRefreshSessions1760274000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "refresh_sessions" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "token_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revoked_at" TIMESTAMP WITH TIME ZONE,
        "replaced_by_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_sessions_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_refresh_sessions_user_active" ON "refresh_sessions" ("user_id", "revoked_at")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_refresh_sessions_expires_at" ON "refresh_sessions" ("expires_at")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "refresh_sessions"');
  }
}
