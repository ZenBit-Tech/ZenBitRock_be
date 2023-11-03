import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTable1699033752090 implements MigrationInterface {
  name = "CreateAuthTable1699033752090";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `auth` (`id` varchar(36) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `name` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, UNIQUE INDEX `IDX_62079b42ede8798e6ea2bb6d14` (`name`), UNIQUE INDEX `IDX_b54f616411ef3824f6a5c06ea4` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DROP INDEX `IDX_b54f616411ef3824f6a5c06ea4` ON `auth`"
    );
    await queryRunner.query(
      "DROP INDEX `IDX_62079b42ede8798e6ea2bb6d14` ON `auth`"
    );
    await queryRunner.query("DROP TABLE `auth`");
  }
}
