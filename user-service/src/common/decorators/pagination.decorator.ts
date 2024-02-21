import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const PaginationDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    let pageNumber = parseInt(request.query.pageNumber);
    let pageSize = parseInt(request.query.pageSize);
    if (!pageNumber || isNaN(pageNumber)) {
      pageNumber = 1;
    }
    if (!pageSize || isNaN(pageSize)) {
      pageSize = 20;
    }
    if (pageSize > 100) {
      pageSize = 100;
    }
    const skip = (pageNumber - 1) * pageSize;
    return { pageNumber, pageSize, skip };
  },
);
