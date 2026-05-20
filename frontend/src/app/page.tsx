"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Home,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  Wallet,
  Building2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { api, endpoints } from "@/lib/api";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { DashboardData } from "@/types";
import Link from "next/link";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get(endpoints.dashboard);
      return res.data.data as DashboardData;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const monthlyChart = (data?.monthly_stats || []).map((m) => ({
    month: m.month ? new Date(m.month).toLocaleDateString("ar-EG", { month: "short" }) : "",
    revenue: m.revenue || 0,
    bookings: m.count || 0,
  }));

  const profitChart = [
    { name: "الإيرادات", value: data?.total_revenue || 0 },
    { name: "المصروفات", value: data?.total_expenses || 0 },
    { name: "إيجار الملاك", value: data?.owner_rental_costs || 0 },
    { name: "صافي الربح", value: data?.net_profit || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة شاملة على أداء الشاليهات</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="إجمالي الشاليهات" value={data?.total_chalets ?? 0} icon={Building2} iconClassName="bg-blue-500/10 text-blue-600" />
        <StatCard title="شاليهات مؤجرة" value={data?.rented_chalets ?? 0} icon={Home} iconClassName="bg-amber-500/10 text-amber-600" />
        <StatCard title="إجمالي الأرباح" value={formatCurrency(data?.total_revenue ?? 0)} icon={TrendingUp} iconClassName="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="إجمالي المصروفات" value={formatCurrency(data?.total_expenses ?? 0)} icon={TrendingDown} iconClassName="bg-red-500/10 text-red-600" />
        <StatCard title="صافي الربح" value={formatCurrency(data?.net_profit ?? 0)} icon={Wallet} iconClassName="bg-purple-500/10 text-purple-600" />
        <StatCard title="عدد الحجوزات" value={data?.total_bookings ?? 0} icon={CalendarCheck} iconClassName="bg-cyan-500/10 text-cyan-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="الإيرادات" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="bookings" name="الحجوزات" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأرباح والخسائر</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={profitChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>أحدث الحجوزات</CardTitle>
            <Link href="/bookings" className="text-sm text-primary hover:underline">عرض الكل</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.latest_bookings || []).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{b.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{b.chalet_name}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{formatCurrency(b.final_amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(b.check_in)}</p>
                  </div>
                </div>
              ))}
              {!data?.latest_bookings?.length && (
                <p className="text-center text-muted-foreground py-8">لا توجد حجوزات</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أفضل الشاليهات أداءً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.top_chalets || []).map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{c.chalet__name}</p>
                      <p className="text-sm text-muted-foreground">{c.booking_count} حجز</p>
                    </div>
                  </div>
                  <Badge variant="success">{formatCurrency(c.revenue)}</Badge>
                </div>
              ))}
            </div>
            {data?.profit_summary && (
              <div className="mt-4 rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">نسبة الإشغال</p>
                <p className="text-2xl font-bold">{data.profit_summary.occupancy_rate}%</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
