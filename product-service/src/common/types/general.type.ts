export type PaginatorType = {
  pageNumber: number;
  pageSize: number;
  skip: number;
};

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}