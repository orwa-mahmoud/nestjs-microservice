import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('blacklist')
export class BlacklistEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ unique: true })
  token: string;

  //TO_DO: cron job to clean the table depend on if the token got expired already
  @Column('timestamptz')
  expiresAt: Date;

  @CreateDateColumn()
  createdDate: Date;
}
