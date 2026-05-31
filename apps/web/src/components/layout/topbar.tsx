'use client';
import { money } from '@/lib/utils';
import { useReportOverview } from '@/hooks/use-reports';
import { useCustomers } from '@/hooks/use-customers';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { data: overview } = useReportOverview();

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-6 py-3.5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Pill label="Facturado" value={money(overview?.totalFacturado ?? 0)} />
        <Pill
          label="Ganancia neta"
          value={money(overview?.totalGanancia ?? 0)}
          highlight="green"
        />
        <Pill
          label="Por cobrar"
          value={money(overview?.totalPorCobrar ?? 0)}
          highlight="orange"
        />
      </div>
    </header>
  );
}

function Pill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'green' | 'orange';
}) {
  return (
    <div
      className={`flex min-w-[110px] flex-col rounded-xl border px-3 py-1.5 ${
        highlight === 'green'
          ? 'border-primary/20 bg-primary/10'
          : highlight === 'orange'
          ? 'border-accent/20 bg-accent/10'
          : 'border-border bg-muted/50'
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={`font-mono text-sm font-semibold ${
          highlight === 'green'
            ? 'text-primary'
            : highlight === 'orange'
            ? 'text-accent'
            : 'text-foreground'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
