import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthenticationService } from '../services/authentication.service';
import { AuthData, AuthDataDecorator } from '../decorators/auth-data.decorator';
import LocalTokenCheckGuard from '../guards/local-token-check.guard';
import { rc } from '../../common/response/response-container';
import { CustomConfigService } from '../../common/config/custom-config.service';
import { EnvKey } from '../../common/config/custom-config.enum';
import { SignupBodyDto } from '../dto/requests/signup.body.dto';
import { LoginBodyDto } from '../dto/requests/login.body.dto';
import { UsersService } from '../../users/services/users.service';
import { UserEmailService } from '../../users/services/user-email.service';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private usersService: UsersService,
    private authenticationService: AuthenticationService,
    private userEmailService: UserEmailService,
    private customConfigService: CustomConfigService,
  ) {}

  @Post('signup')
  @UseInterceptors(ClassSerializerInterceptor)
  async signup(
    @Body() signupDto: SignupBodyDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.usersService.validateEmailIfExists(signupDto.email);
    const createdUser = await this.usersService.signup(signupDto);
    const verificationToken = await this.usersService.generateVerificationToken(
      createdUser,
    );
    this.userEmailService.sendVerificationEmail(createdUser, verificationToken);
    return rc()
      .setData({ user: createdUser })
      .addMessage('Your account is created')
      .getResponse();
  }

  @Post('login')
  @UseInterceptors(ClassSerializerInterceptor)
  async login(
    @Body() loginDto: LoginBodyDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authenticationService.validateUserCredential(
      loginDto.email,
      loginDto.password,
    );
    await this.authenticationService.login(user, loginDto.rememberMe, response);
    return rc().setData({ user }).getResponse();
  }

  @Get('me')
  @UseGuards(LocalTokenCheckGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async me(@Req() req: Request, @AuthDataDecorator() authData: AuthData) {
    const responseUser = await this.usersService.findOneBy({
      id: authData.user.id,
    });
    return rc().setData({ user: responseUser }).getResponse();
  }
  @Post('logout')
  @UseGuards(LocalTokenCheckGuard)
  async logout(
    @Req() req: Request,
    @AuthDataDecorator() authData: AuthData,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authCookieName = this.customConfigService.get(
      EnvKey.AUTH_COOKIE_NAME,
    ) as string;
    const jwtToken = req.cookies[authCookieName];
    await this.authenticationService.addTokenToBlackList(
      jwtToken,
      authData.user,
    );
    response.clearCookie(authCookieName);
    return rc().addMessage('logged out Successfully.').getResponse();
  }
}
