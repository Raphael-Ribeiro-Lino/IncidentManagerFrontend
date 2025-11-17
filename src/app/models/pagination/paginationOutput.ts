export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginationOutput<T> {
  content: T[];
  page: PageInfo;
}
