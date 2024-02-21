import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';
import { UserRoles, UserStatuses } from '../enums/user.enum';
import { rc } from '../../common/response/response-container';
import { SignupBodyDto } from '../../auth/dto/requests/signup.body.dto';
import { EnvKey } from '../../common/config/custom-config.enum';
import { CustomConfigService } from '../../common/config/custom-config.service';
import { randomBytes } from 'crypto';
import { GetUsersInformationCommand } from '../../common/rabbitmq/commands/user/get-users-information.command';
import { PaginatorType } from '../../common/types/general.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private customConfigService: CustomConfigService,
  ) {}

  async findOneBy(criteria: Record<string, any>): Promise<UserEntity> {
    return await this.userRepository.findOneBy(criteria);
  }

  async validateResendVerificationEmail(email: string): Promise<UserEntity> {
    const user = await this.findOneBy({
      email,
    });
    if (!user) {
      throw rc().errorNotFound('User Not Found.');
    }
    if (user.lastVerificationEmailSentAt) {
      const sendEmailWaitMinutes = this.customConfigService.get<number>(
        EnvKey.RESEND_EMAIL_WAIT_MINUTES,
      );
      const elapsedTime =
        Date.now() - user.lastVerificationEmailSentAt.getTime();
      if (elapsedTime < sendEmailWaitMinutes * 60 * 1000) {
        throw rc().errorTooManyAttempt(
          'Please wait before requesting a new email.',
        );
      }
    }
    return user;
  }

  async generateVerificationToken(user: UserEntity): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);
    user.verifiedTokenExpiresAt = new Date(Date.now() + 3600000 * 24); // 24 hour
    user.verifiedToken = hashedToken;
    await this.userRepository.update(user.id, {
      verifiedToken: user.verifiedToken,
      verifiedTokenExpiresAt: user.verifiedTokenExpiresAt,
      lastVerificationEmailSentAt: user.lastVerificationEmailSentAt,
    });
    return user.verifiedToken;
  }
  async signup(signupDto: SignupBodyDto): Promise<UserEntity> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { repeatPassword, ...userData } = signupDto;

    const newUser = this.userRepository.create({
      ...userData,
      status: UserStatuses.UN_VERIFIED,
      role: UserRoles.USER,
      password: await bcrypt.hash(signupDto.password, 12),
    });
    return this.userRepository.save(newUser);
  }

  async validateEmailIfExists(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      throw rc().errorConflict('Email already exists.');
    }
  }

  async verifyAccount(
    email: string,
    verifiedToken: string,
  ): Promise<{ user: UserEntity; message: string }> {
    const user = await this.findOneBy({ email });
    if (!user) {
      throw rc().errorNotFound('User not found.');
    }
    if (user.status !== UserStatuses.UN_VERIFIED) {
      return { user, message: 'Your account is already verified' };
    }
    if (user.verifiedToken !== verifiedToken) {
      throw rc().errorConflict('Your account is already verified');
    }
    if (user.verifiedTokenExpiresAt < new Date(Date.now())) {
      throw rc().errorGone('Verification link expired.');
    }
    await this.userRepository.update(user.id, {
      status: UserStatuses.VERIFIED,
    });
    return { user, message: 'Your account has been successfully verified.' };
  }

  async getUsersInformation(
    getFilesInformationCommand: GetUsersInformationCommand,
  ): Promise<UserEntity[]> {
    if (getFilesInformationCommand.usersIds?.length) {
      return this.userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
        .where('user.id IN (:...ids)', {
          ids: getFilesInformationCommand.usersIds,
        })
        .getMany();
    }
    return [];
  }

  async getUsers(paginator: PaginatorType): Promise<[UserEntity[], number]> {
    return this.userRepository
      .createQueryBuilder('user')
      .skip(paginator.skip)
      .take(paginator.pageSize)
      .getManyAndCount();
  }
}
