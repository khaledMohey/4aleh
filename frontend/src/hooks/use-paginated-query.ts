import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/types";

export function usePaginatedQuery<T>(
  key: string[],
  endpoint: string,
  page: number,
  params?: Record<string, string>
) {
  const searchParams = new URLSearchParams({ page: String(page), ...params });
  return useQuery({
    queryKey: [...key, page, params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<T>>(`${endpoint}?${searchParams}`);
      return res.data;
    },
  });
}
