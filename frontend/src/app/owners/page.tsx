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
import type { OwnerContract, Chalet, Owner } from "@/types";

const emptyForm = {
  chalet: "", owner: "", daily_rate: "0",
  start_date: "", end_date: "",
  payment_method: "cash", payment_status: "unpaid",
  paid_amount: "0", notes: "",
};

export default function OwnersPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OwnerContract | null>(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const { data, isLoading } = usePaginatedQuery<OwnerContract>(["contracts"], endpoints.contracts, page);

  const { data: chalets } = useQuery({
    queryKey: ["chalets-all"],
    queryFn: async () => (await api.get(`${endpoints.chalets}?page_size=100`)).data.results as Chalet[],
  });

  const { data: owners } = useQuery({
    queryKey: ["owners-all"],
    queryFn: async () => (await api.get(`${endpoints.owners}?page_size=100`)).data.results as Owner[],
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, chalet: +form.chalet, owner: +form.owner };
      if (editing) await api.patch(`${endpoints.contracts}${editing.id}/`, payload);
      else await api.post(endpoints.contracts, payload);
    },
    onSuccess: () => {
      toast.success(editing ? "تم التحديث" : "تم التسجيل");
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`${endpoints.contracts}${id}/`),
    onSuccess: () => { toast.success("تم الحذف"); queryClient.invalidateQueries({ queryKey: ["contracts"] }); },
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: OwnerContract) => {
    setEditing(c);
    setForm({
      chalet: String(c.chalet), owner: String(c.owner),
      daily_rate: c.daily_rate, start_date: c.start_date, end_date: c.end_date,
      payment_method: c.payment_method, payment_status: c.payment_status,
      paid_amount: c.paid_amount, notes: c.notes,
    });
    setDialogOpen(true);
  };

  const columns: ColumnDef<OwnerContract>[] = [
    { accessorKey: "owner_name", header: "المالك" },
    { accessorKey: "chalet_name", header: "الشاليه" },
    { accessorKey: "start_date", header: "البداية", cell: ({ row }) => formatDate(row.original.start_date) },
    { accessorKey: "end_date", header: "النهاية", cell: ({ row }) => formatDate(row.original.end_date) },
    { accessorKey: "days_count", header: "الأيام" },
    { accessorKey: "total_cost", header: "الإجمالي", cell: ({ row }) => formatCurrency(row.original.total_cost) },
    { accessorKey: "payment_status", header: "الدفع", cell: ({ row }) => <Badge>{row.original.payment_status}</Badge> },
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
      <PageHeader title="إيجار الشاليهات من الملاك" description="تسجيل عقود الاستئجار من الملاك" actionLabel="عقد جديد" onAction={openCreate} />
      <DataTable columns={columns} data={data?.results || []} isLoading={isLoading} page={page} totalPages={data ? Math.ceil(data.count / 20) : 1} onPageChange={setPage} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "تعديل عقد" : "عقد إيجار جديد"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>الشاليه</Label>
              <Select value={form.chalet} onValueChange={(v) => setForm({ ...form, chalet: v })}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>{(chalets || []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>المالك</Label>
              <Select value={form.owner} onValueChange={(v) => setForm({ ...form, owner: v })}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>{(owners || []).map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>سعر اليوم</Label><Input type="number" value={form.daily_rate} onChange={(e) => setForm({ ...form, daily_rate: e.target.value })} /></div>
            <div><Label>المبلغ المدفوع</Label><Input type="number" value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} /></div>
            <div><Label>تاريخ البداية</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
            <div><Label>تاريخ النهاية</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
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
            <div>
              <Label>طريقة الدفع</Label>
              <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="transfer">تحويل</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4"><Label>ملاحظات</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <p className="text-xs text-muted-foreground mt-2">يتم حساب عدد الأيام وإجمالي التكلفة تلقائياً</p>
          <Button className="mt-4 w-full" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>حفظ</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
