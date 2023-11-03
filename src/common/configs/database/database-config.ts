import { DataSourceOptions, getMetadataArgsStorage } from 'typeorm';
import { extname } from 'path';
import * as process from 'process';

export const databaseConfiguration = (
  isMigrationRun = true,
): DataSourceOptions => {
  const migrationFolder = 'migrations';
  const ext = extname(__filename);

  return {
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [
      `**/*.entity${ext}`,
      ...getMetadataArgsStorage().tables.map((tbl) => tbl.target),
    ],
    migrations: [`${migrationFolder}/${ext}`],
    migrationsTableName: 'migrations',
    migrationsRun: isMigrationRun,
    logging: true,
    synchronize: true,
  };
};
