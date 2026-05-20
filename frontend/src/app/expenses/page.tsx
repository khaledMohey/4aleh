"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Expense, Chalet } from "@/types";

const EXPENSE_TYPES = [
  { value: "maintenance", label: "صيانة" },
  { value: "electricity", label: "كهرباء" },
  { value: "water", label: "مياه" },
  { value: "cleaning", label: "تنظيف" },
  { value: "internet", label: "إنترنت" },
  { value: "salaries", label: "مرتبات" },
  { value: "other", label: "أخرى" },
];

const emptyForm = { chalet: "", expense_type: "maintenance", amount: "0", date: "", notes: "" };

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const { data, isLoading } = usePaginatedQuery<Expense>(["expenses"], endpoints.expenses, page);

  const { data: chalets } = useQuery({
    queryKey: ["chalets-all"],
    queryFn: async () => (await api.get(`${endpoints.chalets}?page_size=100`)).data.results as Chalet[],
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, chalet: +form.chalet };
      if (editing) await api.patch(`${endpoints.expenses}${editing.id}/`, payload);
      else await api.post(endpoints.expenses, payload);
    },
    onSuccess: () => {
      toast.success(editing ? "تم التحديث" : "تم الإضافة");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`${endpoints.expenses}${id}/`),
    onSuccess: () => { toast.success("تم الحذف"); queryClient.invalidateQueries({ queryKey: ["expenses"] }); },
  });

  const columns: ColumnDef<Expense>[] = [
    { accessorKey: "chalet_name", header: "الشاليه" },
    { accessorKey: "expense_type_display", header: "النوع" },
    { accessorKey: "amount", header: "المبلغ", cell: ({ row }) => formatCurrency(row.original.amount) },
    { accessorKey: "date", header: "التاريخ", cell: ({ row }) => formatDate(row.original.date) },
    {
      id: "actions",
      header: "إجراءات",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(row.original); setForm({ chalet: String(row.original.chalet), expense_type: row.original.expense_type, amount: row.original.amount, date: row.original.date, notes: row.original.notes }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(row.original.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="إدارة المصروفات" description="مصروفات الشاليهات" actionLabel="مصروف جديد" onAction={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true); }} />
      <DataTable columns={columns} data={data?.results || []} isLoading={isLoading} page={page} totalPages={data ? Math.ceil(data.count / 20) : 1} onPageChange={setPage} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "تعديل مصروف" : "مصروف جديد"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>الشاليه</Label>
              <Select value={form.chalet} onValueChange={(v) => setForm({ ...form, chalet: v })}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>{(chalets || []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>نوع المصروف</Label>
              <Select value={form.expense_type} onValueChange={(v) => setForm({ ...form, expense_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXPENSE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>المبلغ</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div><Label>التاريخ</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>ملاحظات</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
