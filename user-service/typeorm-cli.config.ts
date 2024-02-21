import { DataSource } from 'typeorm';
import { UserEntity } from './src/users/entities/user.entity';
import { BlacklistEntity } from './src/auth/entities/blacklist.entity';
export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [UserEntity, BlacklistEntity],
  migrations: [],
});
