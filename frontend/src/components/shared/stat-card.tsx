import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  className?: string;
  iconClassName?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, className, iconClassName }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
            {trend && <p className="mt-1 text-xs text-emerald-600">{trend}</p>}
          </div>
          <div className={cn("rounded-xl p-3", iconClassName || "bg-primary/10 text-primary")}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
