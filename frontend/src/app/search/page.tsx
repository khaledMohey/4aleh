"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import Link from "next/link";
import { api, endpoints } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      const res = await api.get(`${endpoints.search}?q=${encodeURIComponent(q)}`);
      return res.data.data;
    },
    enabled: q.length >= 2,
  });

  if (!q || q.length < 2) {
    return <p className="text-muted-foreground text-center py-16">أدخل كلمة بحث (حرفين على الأقل)</p>;
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const sections = [
    { key: "chalets", title: "الشاليهات", href: "/chalets", items: data?.chalets },
    { key: "customers", title: "العملاء", href: "/bookings", items: data?.customers },
    { key: "bookings", title: "الحجوزات", href: "/bookings", items: data?.bookings },
    { key: "owners", title: "الملاك", href: "/owners", items: data?.owners },
    { key: "expenses", title: "المصروفات", href: "/expenses", items: data?.expenses },
  ];

  const hasResults = sections.some((s) => s.items?.length);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">نتائج البحث: &quot;{q}&quot;</h1>
      {!hasResults && <p className="text-muted-foreground text-center py-8">لا توجد نتائج</p>}
      {sections.map((section) =>
        section.items?.length ? (
          <Card key={section.key}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{section.title}</CardTitle>
              <Link href={section.href} className="text-sm text-primary hover:underline">عرض الكل</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {section.items.map((item: { id: number; name?: string; customer?: string; chalet?: string }) => (
                  <div key={item.id} className="rounded-lg border p-3 text-sm">
                    {item.name || item.customer || `${item.chalet}`}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <SearchResults />
    </Suspense>
  );
}
