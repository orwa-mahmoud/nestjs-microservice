import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CustomConfigService } from '../../common/config/custom-config.service';
import { EnvKey } from '../../common/config/custom-config.enum';
import { Repository } from 'typeorm';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import {
  ACLConfig,
  TokenData,
  ValidateTokenAndAuthorizeResponse,
} from '../types/auth.type';
import { AuthorizationService } from './authorization.service';
import { UserEntity } from '../../users/entities/user.entity';
import { BlacklistEntity } from '../entities/blacklist.entity';
import { rc } from '../../common/response/response-container';
import * as bcrypt from 'bcrypt';
import { UserStatuses } from '../../users/enums/user.enum';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(BlacklistEntity)
    private blacklistRepository: Repository<BlacklistEntity>,
    private jwtService: JwtService,
    private customConfigService: CustomConfigService,
    private loggerService: CustomLoggerService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async validateUserCredential(
    email: string,
    password: string,
  ): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({
      email: email,
    });

    if (user) {
      if (user.status === UserStatuses.UN_VERIFIED) {
        throw rc().errorConflict('you need to verify your account.');
      }
      if (user.status === UserStatuses.DISABLED) {
        throw rc().errorConflict(
          'your account is disabled, please contact the admin.',
        );
      }
      const passwordIsValid = await bcrypt.compare(password, user.password);
      if (!passwordIsValid) {
        throw rc().errorUnAuthorized(
          'Invalid credentials provided. Please check and try again.',
        );
      }
      return user;
    }
    throw rc().errorUnAuthorized(
      'Invalid credentials provided. Please check and try again.',
    );
  }

  async login(user: UserEntity, rememberMe: boolean, response: Response) {
    await this.createJwtTokenAndSetCookie(user, rememberMe, response);
  }

  /***
   *
   * @param user
   * @param rememberMe
   * @param response
   * generate jwt token for the user and set it at the cookie
   */
  async createJwtTokenAndSetCookie(
    user: UserEntity,
    rememberMe: boolean,
    response: Response,
  ) {
    const expiresIn = this.customConfigService.getExpirationPeriod(rememberMe);
    const jwtToken = await this.jwtService.signAsync(
      {
        id: user.id,
        status: user.status,
      },
      {
        expiresIn,
      },
    );

    const expirationDate =
      this.customConfigService.getExpirationDate(rememberMe);
    response.cookie(
      this.customConfigService.get(EnvKey.AUTH_COOKIE_NAME),
      jwtToken,
      {
        httpOnly: false,
        domain: this.customConfigService.get(EnvKey.AUTH_COOKIE_DOMAIN),
        secure: this.customConfigService.isEnvProduction(),
        sameSite: 'lax',
        expires: expirationDate,
      },
    );
  }

  async validateToken(token: string): Promise<TokenData> {
    try {
      const user = await this.jwtService.verifyAsync(token);
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (!isBlacklisted) {
        return user;
      }
      return null;
    } catch (error) {
      this.loggerService.warn('validate token fail: ', error.toString());
      return null;
    }
  }
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.blacklistRepository.findOne({
      where: {
        token: token,
      },
    });
    return !!result;
  }

  async validateTokenAndAuthorization(
    token: string,
    aclData: ACLConfig[],
  ): Promise<ValidateTokenAndAuthorizeResponse> {
    const userData = await this.validateToken(token);
    if (
      !userData ||
      (userData && userData.status === UserStatuses.UN_VERIFIED)
    ) {
      return {
        isValid: !!userData,
        isAuthorized: false,
        isRestricted: true,
        userData: userData,
      };
    }
    if (aclData.length) {
      const user = await this.usersRepository.findOneBy({
        id: userData.id,
      });
      if (user) {
        const globalAccessRoles = aclData
          .filter((config) => !config.isRestricted)
          .flatMap((config) => config.roles);
        // if the user role in the global roles defined from the controller, it means the user have global access to the resource
        if (globalAccessRoles.length && globalAccessRoles.includes(user.role)) {
          return {
            isValid: true,
            isAuthorized: true,
            isRestricted: false,
            userData: {
              ...userData,
            },
          };
        }
        const limitedAccessRoles = aclData
          .filter((config) => config.isRestricted)
          .flatMap((config) => config.roles);
        // if the user role in the limited roles defined from the controller, it means the user have limited access to the resource
        if (
          limitedAccessRoles.length &&
          limitedAccessRoles.includes(user.role)
        ) {
          return {
            isValid: true,
            isAuthorized: true,
            isRestricted: true,
            userData: {
              ...userData,
            },
          };
        }
      }
    }
    return {
      isValid: true,
      isAuthorized: false,
      isRestricted: false,
      userData: {
        ...userData,
      },
    };
  }

  async addTokenToBlackList(jwtToken: string, tokenData: TokenData) {
    const expiresAt = new Date(tokenData.exp * 1000);
    const blacklistEntry = this.blacklistRepository.create({
      token: jwtToken,
      expiresAt,
    });
    await this.blacklistRepository.save(blacklistEntry);
  }

  async deleteBlacklistedToken() {
    const currentDate = new Date();
    const tokens = await this.blacklistRepository
      .createQueryBuilder('BlacklistEntity')
      .where('BlacklistEntity.expiresAt <= :currentDate', { currentDate })
      .getMany();
    if (tokens.length) {
      this.loggerService.log(
        `Deleting ${tokens.length} blacklisted expired tokens...`,
      );
      await this.blacklistRepository.remove(tokens);
    } else {
      this.loggerService.log(
        `No blacklisted token expired. Cron execution finished...`,
      );
    }
  }
}
