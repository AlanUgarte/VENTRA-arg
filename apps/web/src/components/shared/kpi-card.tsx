import { type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color?: string;
  bg?: string;
}

export function KpiCard({ label, value, sub, icon: Icon, color = 'text-primary', bg = 'bg-primary/10' }: KpiCardProps) {
  return (
    <Card className="p-4">
      <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-xl', bg)}>
        <Icon className={cn('h-5 w-5', color)} />
      </div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}
