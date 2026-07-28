import { useQuery } from "@tanstack/react-query";
import {
  appUpdateQueryKeys,
  getUnreadAppUpdateCount,
} from "../services/app-update.service";

type UseUpdateUnreadCountOptions = {
  enabled?: boolean;
};

export function useUpdateUnreadCount({
  enabled = true,
}: UseUpdateUnreadCountOptions = {}) {
  const query = useQuery({
    queryFn: getUnreadAppUpdateCount,
    queryKey: appUpdateQueryKeys.unreadCount,
    enabled,
    refetchInterval: 60_000,
    retry: 1,
    staleTime: 5_000,
  });

  return {
    ...query,
    badge: getBadge(query.data ?? 0),
    unreadCount: query.data ?? 0,
  };
}

const getBadge = (count: number) => {
  if (count <= 0) {
    return undefined;
  }

  return count > 99 ? "99+" : String(count);
};
