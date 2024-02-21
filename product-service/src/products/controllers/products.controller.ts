import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import RemoteTokenAndAccessCheckGuard from '../../auth/guards/remote-token-and-access-check.guard';
import { CreateProductBodyDto } from '../dto/requests/create-product.body.dto';
import {
  AuthData,
  AuthDataDecorator,
} from '../../auth/decorators/auth-data.decorator';
import { ACL } from '../../auth/decorators/acl-meta-data.decorator';
import { UserRoles } from '../../common/types/user.type';
import { rc } from '../../common/response/response-container';
import { GetProductsParamDto } from '../dto/requests/get-products.param.dto';
import { PaginationDecorator } from '../../common/decorators/pagination.decorator';
import { PaginatorType } from '../../common/types/general.type';
import { GetUsersInformationProducer } from '../../common/rabbitmq/producers';
import { GetUsersInformationCommand } from '../../common/rabbitmq/commands/user/get-users-information.command';

@Controller('/products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private getUsersInformationProducer: GetUsersInformationProducer,
  ) {}

  @Post('/')
  @ACL([{ roles: [UserRoles.ADMIN, UserRoles.USER] }])
  @UseGuards(RemoteTokenAndAccessCheckGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() createProductDto: CreateProductBodyDto,
    @AuthDataDecorator() authData: AuthData,
  ) {
    if (+createProductDto.price <= 0) {
      throw rc().errorConflict('price should be more than 0.');
    }
    const createdProduct = await this.productsService.create(
      createProductDto,
      authData.user.id,
    );
    return rc()
      .setData({ product: createdProduct })
      .addMessage('product created successfully');
  }

  @Get('/')
  @ACL([
    { roles: [UserRoles.ADMIN] },
    { roles: [UserRoles.USER], isRestricted: true },
  ])
  @UseGuards(RemoteTokenAndAccessCheckGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async get(
    @Query() getProductsParamDto: GetProductsParamDto,
    @AuthDataDecorator() authData: AuthData,
    @PaginationDecorator() paginator: PaginatorType,
  ) {
    // if the user restricted, he should be got only his products
    if (authData.isRestricted) {
      getProductsParamDto.createdBy = [authData.user.id];
    }
    const [products, total] = await this.productsService.get(
      getProductsParamDto,
      paginator,
    );
    const uniqueCreatorIds = [
      ...new Set(products.map((product) => product.creatorId)),
    ];
    const userInfo =
      await this.getUsersInformationProducer.sendGetUsersInformationRequest(
        new GetUsersInformationCommand(uniqueCreatorIds),
      );
    const usersById = userInfo.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
    const transformedProduct = products.map((product) => {
      const user = usersById[product.creatorId];
      return {
        ...product,
        user: { ...user },
      };
    });
    return rc()
      .setData({
        date: transformedProduct,
        total,
        pageNumber: paginator.pageNumber,
        pageSize: paginator.pageSize,
      })
      .getResponse();
  }
}
