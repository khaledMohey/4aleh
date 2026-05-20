"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking, Chalet, Customer } from "@/types";

const emptyForm = {
  chalet: "", customer: "", guests_count: 1,
  check_in: "", check_out: "", nightly_price: "0",
  discount: "0", deposit: "0", payment_status: "unpaid",
  status: "confirmed", notes: "",
};

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const params: Record<string, string> = {};
  if (search) params.search = search;

  const { data, isLoading } = usePaginatedQuery<Booking>(["bookings"], endpoints.bookings, page, params);

  const { data: chalets } = useQuery({
    queryKey: ["chalets-all"],
    queryFn: async () => {
      const res = await api.get(`${endpoints.chalets}?page_size=100`);
      return res.data.results as Chalet[];
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["customers-all"],
    queryFn: async () => {
      const res = await api.get(`${endpoints.customers}?page_size=100`);
      return res.data.results as Customer[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, chalet: +form.chalet, customer: +form.customer, guests_count: +form.guests_count };
      if (editing) await api.patch(`${endpoints.bookings}${editing.id}/`, payload);
      else await api.post(endpoints.bookings, payload);
    },
    onSuccess: () => {
      toast.success(editing ? "تم التحديث" : "تم الحجز");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`${endpoints.bookings}${id}/`),
    onSuccess: () => { toast.success("تم الحذف"); queryClient.invalidateQueries({ queryKey: ["bookings"] }); },
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (b: Booking) => {
    setEditing(b);
    setForm({
      chalet: String(b.chalet), customer: String(b.customer), guests_count: b.guests_count,
      check_in: b.check_in, check_out: b.check_out, nightly_price: b.nightly_price,
      discount: b.discount, deposit: b.deposit, payment_status: b.payment_status,
      status: b.status, notes: b.notes,
    });
    setDialogOpen(true);
  };

  const PAYMENT_BADGE: Record<string, "success" | "warning" | "destructive"> = {
    paid: "success", partial: "warning", unpaid: "destructive",
  };

  const columns: ColumnDef<Booking>[] = [
    { accessorKey: "customer_name", header: "العميل" },
    { accessorKey: "chalet_name", header: "الشاليه" },
    { accessorKey: "check_in", header: "الدخول", cell: ({ row }) => formatDate(row.original.check_in) },
    { accessorKey: "check_out", header: "الخروج", cell: ({ row }) => formatDate(row.original.check_out) },
    { accessorKey: "days_count", header: "الأيام" },
    { accessorKey: "final_amount", header: "المبلغ", cell: ({ row }) => formatCurrency(row.original.final_amount) },
    {
      accessorKey: "payment_status",
      header: "الدفع",
      cell: ({ row }) => <Badge variant={PAYMENT_BADGE[row.original.payment_status]}>{row.original.payment_status}</Badge>,
    },
    {
      id: "actions",
      header: "إجراءات",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(row.original.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="حجوزات العملاء" description="تسجيل وتأجير الشاليهات للعملاء" actionLabel="حجز جديد" onAction={openCreate} />
      <Input placeholder="بحث بالعميل أو الشاليه..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-xs mb-4" />
      <DataTable columns={columns} data={data?.results || []} isLoading={isLoading} page={page} totalPages={data ? Math.ceil(data.count / 20) : 1} onPageChange={setPage} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "تعديل حجز" : "حجز جديد"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>الشاليه</Label>
              <Select value={form.chalet} onValueChange={(v) => setForm({ ...form, chalet: v })}>
                <SelectTrigger><SelectValue placeholder="اختر الشاليه" /></SelectTrigger>
                <SelectContent>
                  {(chalets || []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>العميل</Label>
              <Select value={form.customer} onValueChange={(v) => setForm({ ...form, customer: v })}>
                <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                <SelectContent>
                  {(customers || []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>عدد الأفراد</Label><Input type="number" value={form.guests_count} onChange={(e) => setForm({ ...form, guests_count: +e.target.value })} /></div>
            <div><Label>سعر الليلة</Label><Input type="number" value={form.nightly_price} onChange={(e) => setForm({ ...form, nightly_price: e.target.value })} /></div>
            <div><Label>تاريخ الدخول</Label><Input type="date" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} /></div>
            <div><Label>تاريخ الخروج</Label><Input type="date" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} /></div>
            <div><Label>الخصم</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></div>
            <div><Label>العربون</Label><Input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} /></div>
            <div>
              <Label>حالة الدفع</Label>
              <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="partial">جزئي</SelectItem>
                  <SelectItem value="unpaid">غير مدفوع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4"><Label>ملاحظات</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <p className="text-xs text-muted-foreground mt-2">يتم حساب الأيام والمبلغ والربح تلقائياً • يمنع الحجز المتداخل</p>
          <Button className="mt-4 w-full" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>حفظ الحجز</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
