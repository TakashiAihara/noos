/**
 * Data Transfer Objects (DTOs) shared across services
 */

// Pagination
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Sorting
export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
