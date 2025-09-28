export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: 'success' | 'error';
};

export type PaginationParams = {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};