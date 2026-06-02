'use client';
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Package, ShoppingBag, Percent, Wallet } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@/components/ui/card';
import { KpiCard } from '@/components/shared/kpi-card';
import { useReportOverview, useProductRotation, useRubroBreakdown, useSaleHistory } from '@/hooks/use-reports';
import { money, fdate, ftime } from '@/lib/utils';

const RUBRO_COLORS: Record<string, string> = {
  Alimentos: '#0d9f6e',
  Bebidas: '#2f6fed',
  Limpieza: '#06b6d4',
  Chocolates: '#92400e',
  Perfumería: '#d946a8',
  Galletitas: '#d99a1c',
  Congelados: '#3aa0d4',
  Fiambrería: '#f0653e',
};

const fmt = (v: number) => money(v).replace('$', '$');

export default function ReportsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data: overview } = useReportOverview(from || undefined, to || undefined);
  const { data: rotation = [] } = useProductRotation(from || undefined, to || undefined);
  const { data: rubros = [] } = useRubroBreakdown(from || undefined, to || undefined);
  const { data: history } = useSaleHistory(1, from || undefined, to || undefined);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Reportes" subtitle="Facturación, ganancia y rotación" />
      <div className="p-3 md:p-5 space-y-4 md:space-y-5">
        {/* Date filter */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <span className="text-sm font-semibold text-muted-foreground">Período:</span>
          <input
            type="date"
            className="rounded-xl border border-input bg-background px-3 py-1.5 text-sm"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span className="text-muted-foreground">→</span>
          <input
            type="date"
            className="rounded-xl border border-input bg-background px-3 py-1.5 text-sm"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          {(from || to) && (
            <button className="text-xs text-accent hover:underline" onClick={() => { setFrom(''); setTo(''); }}>
              Limpiar
            </button>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          <KpiCard label="Facturación" value={money(overview?.totalFacturado ?? 0)} icon={DollarSign} color="text-blue-600" bg="bg-blue-100" sub={`${overview?.totalUnidades ?? 0} unidades`} />
          <KpiCard label="Ganancia neta" value={money(overview?.totalGanancia ?? 0)} icon={TrendingUp} sub={`Margen ${overview?.margenPct ?? 0}%`} />
          <KpiCard label="Costo invertido" value={money(overview?.totalCosto ?? 0)} icon={ShoppingBag} color="text-yellow-600" bg="bg-yellow-100" sub="Mercadería vendida" />
          <KpiCard label="Ticket promedio" value={money(overview?.ticketPromedio ?? 0)} icon={Package} color="text-cyan-600" bg="bg-cyan-100" sub={`${overview?.totalVentas ?? 0} ventas`} />
          <KpiCard label="Por cobrar" value={money(overview?.totalPorCobrar ?? 0)} icon={Wallet} color="text-violet-600" bg="bg-violet-100" sub="Fiados activos" />
          <KpiCard label="Margen %" value={`${overview?.margenPct ?? 0}%`} icon={Percent} color="text-emerald-600" bg="bg-emerald-100" sub="Sobre facturación" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rotation */}
          <Card>
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="font-bold">Más vendidos (unidades)</h3>
            </div>
            <CardContent className="pt-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rotation} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip formatter={(v: number) => [`${v} u.`, 'Vendidas']} />
                    <Bar dataKey="units" fill="#0d9f6e" radius={[0, 6, 6, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Rubro pie */}
          <Card>
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="font-bold">Facturación por rubro</h3>
            </div>
            <CardContent className="pt-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={rubros} dataKey="revenue" nameKey="rubro" cx="50%" cy="50%" innerRadius={55} outerRadius={90}>
                      {rubros.map((entry: any) => (
                        <Cell key={entry.rubro} fill={RUBRO_COLORS[entry.rubro] ?? '#888'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => money(v)} />
                    <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rubro table + history */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="border-b border-border px-5 py-3.5"><h3 className="font-bold">Desglose por rubro</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Rubro', 'Unidades', 'Facturado', 'Ganancia'].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rubros.map((r: any) => (
                    <tr key={r.rubro} className="border-b border-border/50">
                      <td className="px-4 py-2 font-semibold flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: RUBRO_COLORS[r.rubro] ?? '#888' }} />
                        {r.rubro}
                      </td>
                      <td className="px-4 py-2">{r.units}</td>
                      <td className="px-4 py-2 font-mono">{money(r.revenue)}</td>
                      <td className="px-4 py-2 font-mono text-primary">{money(r.ganancia)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h3 className="font-bold">Historial de ventas</h3>
              <span className="text-sm text-muted-foreground">{history?.total ?? 0} registros</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {history?.data?.map((sale: any) => (
                <div key={sale.id} className="flex items-start justify-between border-b border-border/50 px-5 py-2.5 hover:bg-muted/30 text-sm">
                  <div>
                    <p className="font-semibold">
                      #{String(sale.orderNumber).padStart(4, '0')} · {sale.type === 'CREDIT' ? '🟣 Fiado' : '🟢 Contado'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fdate(sale.createdAt)} {ftime(sale.createdAt)} · {sale.user?.name}
                      {sale.customer && ` · ${sale.customer.name}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">{money(Number(sale.total))}</p>
                    <p className="text-xs text-primary">
                      +{money(sale.lines?.reduce((s: number, l: any) => s + (Number(l.subtotal) - Number(l.costUnit) * l.quantity), 0) ?? 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
