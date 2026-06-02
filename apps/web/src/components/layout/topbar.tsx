'use client';
import { Menu } from 'lucide-react';
import { money } from '@/lib/utils';
import { useReportOverview } from '@/hooks/use-reports';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { data: overview } = useReportOverview();
  const { user } = useAuthStore();
  const { toggleSidebar } = useUiStore();
  const isCashier = user?.role === 'CASHIER';

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-3 md:px-6 md:py-3.5">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted transition-colors md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight md:text-xl">{title}</h1>
          {subtitle && <p className="hidden text-xs text-muted-foreground sm:block mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 md:gap-2">
        <Pill label="Facturado" value={money(overview?.totalFacturado ?? 0)} />
        {!isCashier && (
          <Pill label="Ganancia" value={money(overview?.totalGanancia ?? 0)} highlight="green" />
        )}
        <Pill label="Por cobrar" value={money(overview?.totalPorCobrar ?? 0)} highlight="orange" />
      </div>
    </header>
  );
}

function Pill({ label, value, highlight }: { label: string; value: string; highlight?: 'green' | 'orange' }) {
  return (
    <div className={`flex min-w-[86px] flex-col rounded-xl border px-2.5 py-1 md:px-3 md:py-1.5 ${
      highlight === 'green'  ? 'border-primary/20 bg-primary/10' :
      highlight === 'orange' ? 'border-accent/20 bg-accent/10' :
      'border-border bg-muted/50'
    }`}>
      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`font-mono text-xs font-semibold ${
        highlight === 'green' ? 'text-primary' : highlight === 'orange' ? 'text-accent' : 'text-foreground'
      }`}>{value}</span>
    </div>
  );
}
