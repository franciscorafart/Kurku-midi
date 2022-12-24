export type ListQueryOpts = {
  cacheKey: string;
  page?: number;
  resultsPerPage?: number;
  orderBy?: string;
};

export type PaginatedDBResults<T> = {
  totalResults?: number;
  totalPages?: number;
  resultsPerPage?: number;
  data: T[];
  page?: number;
};

export function paginate<T>(
  results: T[],
  opts: ListQueryOpts
): PaginatedDBResults<T> {
  const totalResults = results.length;
  if (!opts.resultsPerPage && !opts.page)
    return { data: results, totalResults };

  const { resultsPerPage = 20, page = 1 } = opts;
  const start = page * resultsPerPage;
  const data = results.slice(start - 1, resultsPerPage);
  const totalPages = Math.floor(results.length / resultsPerPage);

  return {
    data,
    page,
    resultsPerPage,
    totalPages,
    totalResults,
  };
}

export type ADIDBInterface<T> = Record<string, (...a: any[]) => any> & {
  listItems(opts: ListQueryOpts): Promise<PaginatedDBResults<T>>;
  getItem(id: string): Promise<T | null>;
  putItem(id: string, val: any): Promise<any | null>;
  removeItem(id: string): Promise<any>;
};
