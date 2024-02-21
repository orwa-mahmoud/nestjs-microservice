import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRoles, UserStatuses } from '../enums/user.enum';

@Entity('user')
@Unique(['email'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserStatuses,
    default: UserStatuses.UN_VERIFIED,
  })
  status: UserStatuses;

  @Column({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.USER,
  })
  role: UserRoles;

  @Exclude()
  @Column({ nullable: true })
  verifiedToken: string;

  @Exclude()
  @Column({ nullable: true })
  verifiedTokenExpiresAt: Date;

  @Exclude()
  @Column({ nullable: true })
  lastVerificationEmailSentAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
