"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { ar } from "date-fns/locale";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { api, endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CalendarEvent } from "@/types";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { data: events, isLoading } = useQuery({
    queryKey: ["calendar", start, end],
    queryFn: async () => {
      const res = await api.get(`${endpoints.calendar}?start=${start}&end=${end}`);
      return res.data as CalendarEvent[];
    },
  });

  const days = useMemo(() => {
    const startD = startOfMonth(currentMonth);
    const endD = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: startD, end: endD });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) => {
    return (events || []).filter((e) => {
      try {
        const startDate = parseISO(e.start);
        const endDate = parseISO(e.end);
        return isWithinInterval(day, { start: startDate, end: endDate });
      } catch {
        return false;
      }
    });
  };

  const weekDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تقويم الحجوزات</h1>
          <p className="text-muted-foreground">عرض الحجوزات والعقود والأيام المتاحة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="font-semibold min-w-[140px] text-center">
            {format(currentMonth, "MMMM yyyy", { locale: ar })}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <Badge className="bg-blue-500">حجوزات العملاء</Badge>
        <Badge className="bg-amber-500">عقود الملاك</Badge>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: days[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px]" />
              ))}
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[100px] rounded-lg border p-1 transition-colors ${
                      isToday ? "border-primary bg-primary/5" : "border-border"
                    } ${!isSameMonth(day, currentMonth) ? "opacity-40" : ""}`}
                  >
                    <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="truncate rounded px-1 py-0.5 text-[10px] text-white"
                          style={{ backgroundColor: e.color }}
                          title={e.title}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 2}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>الأحداث هذا الشهر</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(events || []).map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: e.color }} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.start} → {e.end}</p>
                </div>
                <Badge variant="outline">{e.type === "booking" ? "حجز" : "عقد مالك"}</Badge>
              </div>
            ))}
            {!events?.length && <p className="text-center text-muted-foreground py-4">لا توجد أحداث</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
