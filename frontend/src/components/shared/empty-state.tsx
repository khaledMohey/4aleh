import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon: Icon = Inbox, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
