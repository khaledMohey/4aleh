"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer, FileSpreadsheet } from "lucide-react";
import { api, endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const REPORT_TYPES = [
  { value: "profit", label: "تقرير الأرباح" },
  { value: "bookings", label: "تقرير الحجوزات" },
  { value: "expenses", label: "تقرير المصروفات" },
  { value: "occupancy", label: "تقرير الإشغال" },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("profit");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["reports", reportType, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ type: reportType });
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      const res = await api.get(`${endpoints.reports}?${params}`);
      return res.data.data;
    },
  });

  const handleExport = (format: "excel" | "pdf") => {
    const params = new URLSearchParams({ type: reportType, export: format });
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}${endpoints.reports}?${params}`, "_blank");
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">التقارير</h1>
          <p className="text-muted-foreground">تقارير احترافية مع تصدير وطباعة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("excel")}>
            <FileSpreadsheet className="h-4 w-4 ml-2" /> Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="h-4 w-4 ml-2" /> PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 ml-2" /> طباعة
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label>نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>من تاريخ</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div><Label>إلى تاريخ</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="grid gap-6">
          {reportType === "profit" && data && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">إجمالي الإيرادات</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(data.total_revenue)}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">المصروفات</p><p className="text-2xl font-bold text-red-600">{formatCurrency(data.total_expenses)}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">إيجار الملاك</p><p className="text-2xl font-bold text-amber-600">{formatCurrency(data.total_owner_costs)}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">صافي الربح</p><p className="text-2xl font-bold text-primary">{formatCurrency(data.net_profit)}</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle>أرباح كل شاليه</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.chalets || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="chalet_name" />
                      <YAxis />
                      <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
                      <Bar dataKey="net_profit" name="صافي الربح" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {reportType === "bookings" && data && (
            <Card>
              <CardHeader><CardTitle>تقرير الحجوزات ({data.count})</CardTitle></CardHeader>
              <CardContent>
                <p className="text-lg font-bold mb-4">إجمالي الإيرادات: {formatCurrency(data.total_revenue)}</p>
                <div className="space-y-2">
                  {(data.bookings || []).map((b: { id: number; customer_name: string; chalet_name: string; final_amount: string }) => (
                    <div key={b.id} className="flex justify-between border-b py-2">
                      <span>{b.customer_name} - {b.chalet_name}</span>
                      <span className="font-semibold">{formatCurrency(b.final_amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {reportType === "expenses" && data && (
            <Card>
              <CardHeader><CardTitle>تقرير المصروفات</CardTitle></CardHeader>
              <CardContent>
                <p className="text-lg font-bold mb-4">الإجمالي: {formatCurrency(data.total)}</p>
                {(data.by_type || []).map((t: { type: string; total: number }) => (
                  <div key={t.type} className="flex justify-between border-b py-2">
                    <span>{t.type}</span>
                    <span>{formatCurrency(t.total)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {reportType === "occupancy" && data && (
            <Card>
              <CardHeader><CardTitle>تقرير الإشغال</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(data as { chalet_name: string; status: string; booking_count: number; total_booking_days: number }[]).map((item) => (
                    <div key={item.chalet_name} className="flex justify-between border-b py-2">
                      <span>{item.chalet_name} ({item.status})</span>
                      <span>{item.booking_count} حجز • {item.total_booking_days} يوم</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
