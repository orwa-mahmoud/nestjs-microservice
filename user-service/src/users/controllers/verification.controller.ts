import { Controller, Get, Post, Put, Query } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { rc } from '../../common/response/response-container';
import { SendVerificationQueryDto } from '../dto/requests/send-verification.query.dto';
import { UserEmailService } from '../services/user-email.service';
import { VerifyAccountQueryDto } from '../dto/requests/verify-account.query.dto';

@Controller('verification')
export class VerificationController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userEmailService: UserEmailService,
  ) {}
  @Put('/send')
  async sendVerification(
    @Query() sendVerificationDto: SendVerificationQueryDto,
  ) {
    console.log('here we are');
    console.log(sendVerificationDto);
    const user = await this.usersService.validateResendVerificationEmail(
      sendVerificationDto.email,
    );
    const verificationToken = await this.usersService.generateVerificationToken(
      user,
    );
    const success = await this.userEmailService.sendVerificationEmail(
      user,
      verificationToken,
    );
    if (success) {
      return rc()
        .setCreated('Verification email is sent successfully.')
        .getResponse();
    } else {
      throw rc().errorFail('something went wrong, please try again');
    }
  }

  // this should be post and the frontend used it, I made it get to make the link works from console immediately
  @Get('/verify')
  async verifyAccount(@Query() accountVerifyDto: VerifyAccountQueryDto) {
    const { user, message } = await this.usersService.verifyAccount(
      accountVerifyDto.email,
      accountVerifyDto.token,
    );
    return rc().addMessage(message).getResponse();
  }
}
