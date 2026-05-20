"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { Notification, PaginatedResponse } from "@/types";

const PRIORITY_VARIANT: Record<string, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Notification>>(endpoints.notifications);
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.post(`${endpoints.notifications}${id}/mark_read/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.post(`${endpoints.notifications}mark_all_read/`),
    onSuccess: () => {
      toast.success("تم تحديد الكل كمقروء");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post(`${endpoints.notifications}generate/`),
    onSuccess: () => {
      toast.success("تم توليد الإشعارات");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const notifications = data?.results || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          <p className="text-muted-foreground">تنبيهات النظام والدفعات والحجوزات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
            <RefreshCw className="h-4 w-4 ml-2" /> توليد
          </Button>
          <Button variant="outline" onClick={() => markAllMutation.mutate()}>
            <CheckCheck className="h-4 w-4 ml-2" /> قراءة الكل
          </Button>
        </div>
      </div>

      {!notifications.length ? (
        <EmptyState title="لا توجد إشعارات" description="اضغط توليد لإنشاء إشعارات من البيانات الحالية" icon={Bell} actionLabel="توليد الإشعارات" onAction={() => generateMutation.mutate()} />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={n.is_read ? "opacity-60" : ""}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`rounded-full p-2 ${n.is_read ? "bg-muted" : "bg-primary/10"}`}>
                  <Bell className={`h-5 w-5 ${n.is_read ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{n.title}</p>
                    <Badge variant={PRIORITY_VARIANT[n.priority]}>{n.priority}</Badge>
                    {!n.is_read && <Badge>جديد</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(n.created_at).toLocaleString("ar-EG")}
                  </p>
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate(n.id)}>
                    قراءة
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
