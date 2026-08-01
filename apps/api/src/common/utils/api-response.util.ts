export interface MetaPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SuccessResponse<T> {
  readonly success = true;
  constructor(
    readonly statusCode: number,
    readonly message: string,
    readonly data: T,
  ) {}
}

export class PaginatedResponse<T> {
  readonly success = true;
  constructor(
    readonly statusCode: number,
    readonly message: string,
    readonly data: T[],
    readonly meta: MetaPagination,
  ) {}
}

export class ErrorResponse {
  readonly success = false;
  readonly timestamp: string;
  constructor(
    readonly statusCode: number,
    readonly message: string | string[],
    readonly error: string,
    readonly path: string,
    readonly errorCode?: string,
  ) {
    this.timestamp = new Date().toISOString();
  }
}
