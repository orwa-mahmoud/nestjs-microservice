import {ClassSerializerInterceptor, Controller, Get, UseGuards, UseInterceptors} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { PaginationDecorator } from '../../common/decorators/pagination.decorator';
import { PaginatorType } from '../../common/types/general.type';
import { rc } from '../../common/response/response-container';
import { pick } from '../../common/helpers/general.helper';
import { UserEntity } from '../entities/user.entity';
import LocalTokenAndAccessCheckGuard from '../../auth/guards/local-token-and-access-check.guard';
import { ACL } from '../../auth/decorators/acl-meta-data.decorator';
import { UserRoles } from '../enums/user.enum';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ACL([{ roles: [UserRoles.ADMIN] }])
  @UseGuards(LocalTokenAndAccessCheckGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getUsers(@PaginationDecorator() paginator: PaginatorType) {
    const [data, total] = await this.usersService.getUsers(paginator);
    const transformedData = data.map((user: UserEntity) => {
      return pick(user, ['id', 'firstName', 'lastName', 'email', 'role']);
    });
    return rc()
      .setData({
        date: transformedData,
        total,
        pageNumber: paginator.pageNumber,
        pageSize: paginator.pageSize,
      })
      .getResponse();
  }
}
