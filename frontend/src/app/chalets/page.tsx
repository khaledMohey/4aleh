"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Eye } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import type { Chalet, PaginatedResponse } from "@/types";

const STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  available: { label: "متاح", variant: "success" },
  rented: { label: "مؤجر", variant: "warning" },
  maintenance: { label: "صيانة", variant: "secondary" },
};

const FEATURES = [
  { id: "pool", label: "حمام سباحة" },
  { id: "wifi", label: "واي فاي" },
  { id: "ac", label: "تكييف" },
  { id: "kitchen", label: "مطبخ" },
  { id: "sea_view", label: "بحر" },
  { id: "parking", label: "موقف" },
  { id: "bbq", label: "شواية" },
  { id: "garden", label: "حديقة" },
];

const emptyForm = {
  name: "", code: "", location: "", city: "", description: "",
  rooms_count: 1, bathrooms_count: 1, capacity: 4,
  status: "available", features: [] as string[], notes: "", nightly_price: "0",
};

export default function ChaletsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Chalet | null>(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = usePaginatedQuery<Chalet>(["chalets"], endpoints.chalets, page, params);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.patch(`${endpoints.chalets}${editing.id}/`, form);
      } else {
        await api.post(endpoints.chalets, form);
      }
    },
    onSuccess: () => {
      toast.success(editing ? "تم التحديث" : "تم الإضافة");
      queryClient.invalidateQueries({ queryKey: ["chalets"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`${endpoints.chalets}${id}/`),
    onSuccess: () => {
      toast.success("تم الحذف");
      queryClient.invalidateQueries({ queryKey: ["chalets"] });
    },
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: Chalet) => {
    setEditing(c);
    setForm({
      name: c.name, code: c.code, location: c.location, city: c.city,
      description: c.description, rooms_count: c.rooms_count,
      bathrooms_count: c.bathrooms_count, capacity: c.capacity,
      status: c.status, features: c.features || [], notes: c.notes,
      nightly_price: c.nightly_price,
    });
    setDialogOpen(true);
  };

  const toggleFeature = (id: string) => {
    setForm((f) => ({
      ...f,
      features: f.features.includes(id) ? f.features.filter((x) => x !== id) : [...f.features, id],
    }));
  };

  const columns: ColumnDef<Chalet>[] = [
    { accessorKey: "code", header: "الكود" },
    { accessorKey: "name", header: "الاسم" },
    { accessorKey: "city", header: "المدينة" },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const s = STATUS_MAP[row.original.status];
        return <Badge variant={s?.variant}>{s?.label || row.original.status}</Badge>;
      },
    },
    {
      accessorKey: "nightly_price",
      header: "سعر الليلة",
      cell: ({ row }) => formatCurrency(row.original.nightly_price),
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

  const totalPages = data ? Math.ceil(data.count / 20) : 1;

  return (
    <div>
      <PageHeader title="إدارة الشاليهات" description="إضافة وتعديل وحذف الشاليهات" actionLabel="إضافة شاليه" onAction={openCreate} />
      <div className="flex flex-wrap gap-3 mb-4">
        <Input placeholder="بحث..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="available">متاح</SelectItem>
            <SelectItem value="rented">مؤجر</SelectItem>
            <SelectItem value="maintenance">صيانة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={data?.results || []} isLoading={isLoading} page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "تعديل شاليه" : "إضافة شاليه"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>الاسم</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>الكود</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>الموقع</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div><Label>المدينة</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div><Label>الغرف</Label><Input type="number" value={form.rooms_count} onChange={(e) => setForm({ ...form, rooms_count: +e.target.value })} /></div>
            <div><Label>الحمامات</Label><Input type="number" value={form.bathrooms_count} onChange={(e) => setForm({ ...form, bathrooms_count: +e.target.value })} /></div>
            <div><Label>السعة</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} /></div>
            <div><Label>سعر الليلة</Label><Input type="number" value={form.nightly_price} onChange={(e) => setForm({ ...form, nightly_price: e.target.value })} /></div>
            <div>
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">متاح</SelectItem>
                  <SelectItem value="rented">مؤجر</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Label>المميزات</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FEATURES.map((f) => (
                <button key={f.id} type="button" onClick={() => toggleFeature(f.id)}
                  className={`rounded-full px-3 py-1 text-sm border transition-colors ${form.features.includes(f.id) ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4"><Label>الوصف</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="mt-4"><Label>ملاحظات</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <Button className="mt-4 w-full" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
