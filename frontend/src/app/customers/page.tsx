"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import type { Customer } from "@/types";

const emptyForm = { name: "", phone: "", email: "", notes: "" };

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const { data, isLoading } = usePaginatedQuery<Customer>(["customers"], endpoints.customers, page);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) await api.patch(`${endpoints.customers}${editing.id}/`, form);
      else await api.post(endpoints.customers, form);
    },
    onSuccess: () => {
      toast.success(editing ? "تم التحديث" : "تم الإضافة");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`${endpoints.customers}${id}/`),
    onSuccess: () => { toast.success("تم الحذف"); queryClient.invalidateQueries({ queryKey: ["customers"] }); },
  });

  const columns: ColumnDef<Customer>[] = [
    { accessorKey: "name", header: "الاسم" },
    { accessorKey: "phone", header: "التليفون" },
    { accessorKey: "email", header: "البريد" },
    { accessorKey: "bookings_count", header: "الحجوزات" },
    {
      id: "actions",
      header: "إجراءات",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(row.original); setForm({ name: row.original.name, phone: row.original.phone, email: row.original.email, notes: row.original.notes }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(row.original.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="العملاء" description="إدارة بيانات العملاء" actionLabel="عميل جديد" onAction={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true); }} />
      <DataTable columns={columns} data={data?.results || []} isLoading={isLoading} page={page} totalPages={data ? Math.ceil(data.count / 20) : 1} onPageChange={setPage} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "تعديل عميل" : "عميل جديد"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div><Label>الاسم</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>التليفون</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>البريد</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <Button onClick={() => saveMutation.mutate()}>حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
