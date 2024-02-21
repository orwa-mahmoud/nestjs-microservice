import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../entities/product.entity';
import { CreateProductBodyDto } from '../dto/requests/create-product.body.dto';
import { GetProductsParamDto } from '../dto/requests/get-products.param.dto';
import { PaginatorType } from '../../common/types/general.type';
import { ALLOWED_PRODUCT_FIELDS_TO_SORT } from '../constants/products.constant';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productEntityRepository: Repository<ProductEntity>,
  ) {}

  async findOneBy(criteria: Record<string, any>): Promise<ProductEntity> {
    return await this.productEntityRepository.findOneBy(criteria);
  }

  create(
    createProductDto: CreateProductBodyDto,
    creatorId: number,
  ): Promise<ProductEntity> {
    return this.productEntityRepository.save({
      ...createProductDto,
      price: +createProductDto.price,
      creatorId,
    });
  }

  async get(
    getProductsParamDto: GetProductsParamDto,
    paginator: PaginatorType,
  ): Promise<[ProductEntity[], number]> {
    const getProductsQuery =
      this.productEntityRepository.createQueryBuilder('product');

    if (getProductsParamDto?.createdBy?.length > 0) {
      getProductsQuery.andWhere('product.creatorId IN (:...uploadedByIds)', {
        uploadedByIds: getProductsParamDto.createdBy,
      });
    }

    if (getProductsParamDto.search) {
      getProductsQuery.andWhere('product.name ILIKE :search', {
        search: `%${getProductsParamDto.search}%`,
      });
    }

    if (
      getProductsParamDto.sort &&
      getProductsParamDto.sortDirection &&
      ALLOWED_PRODUCT_FIELDS_TO_SORT.includes(getProductsParamDto.sort)
    ) {
      getProductsQuery.orderBy(
        `product.${getProductsParamDto.sort}`,
        getProductsParamDto.sortDirection,
      );
    } else {
      getProductsQuery.orderBy('product.createdAt', 'DESC');
    }

    return getProductsQuery
      .skip(paginator.skip)
      .take(paginator.pageSize)
      .getManyAndCount();
  }
}
