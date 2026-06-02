'use client';
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Package, ShoppingBag, Percent, Wallet, RefreshCw } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@/components/ui/card';
import { KpiCard } from '@/components/shared/kpi-card';
import { useReportOverview, useProductRotation, useRubroBreakdown, useSaleHistory } from '@/hooks/use-reports';
import { money, fdate, ftime } from '@/lib/utils';

const RUBRO_COLORS: Record<string, string> = {
  Alimentos: '#0d9f6e', Bebidas: '#2f6fed', Limpieza: '#06b6d4',
  Chocolates: '#92400e', 'Perfumería': '#d946a8', Galletitas: '#d99a1c',
  Congelados: '#3aa0d4', 'Fiambrería': '#f0653e',
};

// Convierte cualquier valor numérico (string, Decimal, number) a number
const n = (v: any): number => {
  if (v === null || v === undefined) return 0;
  const parsed = parseFloat(String(v));
  return isNaN(parsed) ? 0 : parsed;
};

const QUICK_FILTERS = [
  { label: 'Hoy',       getDates: () => { const d = new Date().toISOString().slice(0,10); return { from: d, to: d }; } },
  { label: 'Esta semana', getDates: () => {
    const now = new Date();
    const day = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    return { from: mon.toISOString().slice(0,10), to: now.toISOString().slice(0,10) };
  }},
  { label: 'Este mes', getDates: () => {
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
    return { from, to: now.toISOString().slice(0,10) };
  }},
  { label: 'Todo', getDates: () => ({ from: '', to: '' }) },
];

export default function ReportsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [histPage, setHistPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('Todo');

  const fromParam = from || undefined;
  const toParam   = to   || undefined;

  const { data: overview, isLoading: ovLoading, refetch: refetchOv } = useReportOverview(fromParam, toParam);
  const { data: rotation = [], isLoading: rotLoading }               = useProductRotation(fromParam, toParam);
  const { data: rubros   = [], isLoading: rubLoading }               = useRubroBreakdown(fromParam, toParam);
  const { data: history,       isLoading: histLoading }              = useSaleHistory(histPage, fromParam, toParam);

  const applyQuick = (label: string) => {
    const { from: f, to: t } = QUICK_FILTERS.find(q => q.label === label)!.getDates();
    setFrom(f); setTo(t); setActiveFilter(label); setHistPage(1);
  };

  const salesData = history?.data ?? [];
  const histTotal = history?.total ?? 0;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Reportes" subtitle="Facturación, ganancia y rotación" />
      <div className="p-3 md:p-5 space-y-4">

        {/* Filtro de período */}
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground mr-1">Período:</span>
              {QUICK_FILTERS.map(({ label }) => (
                <button
                  key={label}
                  onClick={() => applyQuick(label)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                    activeFilter === label
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="text-muted-foreground text-xs mx-1">·</span>
              <input
                type="date"
                className="rounded-xl border border-input bg-background px-2 py-1.5 text-xs"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setActiveFilter('Personalizado'); setHistPage(1); }}
              />
              <span className="text-muted-foreground text-xs">→</span>
              <input
                type="date"
                className="rounded-xl border border-input bg-background px-2 py-1.5 text-xs"
                value={to}
                onChange={(e) => { setTo(e.target.value); setActiveFilter('Personalizado'); setHistPage(1); }}
              />
              <button
                onClick={() => refetchOv()}
                className="ml-auto flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Actualizar
              </button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="Facturación"    value={money(n(overview?.totalFacturado))}  icon={DollarSign}  color="text-blue-600"    bg="bg-blue-100"    sub={`${n(overview?.totalUnidades)} unidades`} />
          <KpiCard label="Ganancia neta"  value={money(n(overview?.totalGanancia))}   icon={TrendingUp}  sub={`Margen ${n(overview?.margenPct)}%`} />
          <KpiCard label="Costo"          value={money(n(overview?.totalCosto))}       icon={ShoppingBag} color="text-yellow-600"  bg="bg-yellow-100"  sub="Mercadería vendida" />
          <KpiCard label="Ticket prom."   value={money(n(overview?.ticketPromedio))}   icon={Package}     color="text-cyan-600"    bg="bg-cyan-100"    sub={`${n(overview?.totalVentas)} ventas`} />
          <KpiCard label="Por cobrar"     value={money(n(overview?.totalPorCobrar))}   icon={Wallet}      color="text-violet-600"  bg="bg-violet-100"  sub="Fiados" />
          <KpiCard label="Margen %"       value={`${n(overview?.margenPct)}%`}          icon={Percent}     color="text-emerald-600" bg="bg-emerald-100" sub="Sobre facturación" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Productos más vendidos */}
          <Card>
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="font-bold">Más vendidos (unidades)</h3>
            </div>
            <CardContent className="pt-4">
              {rotLoading ? (
                <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">Cargando…</div>
              ) : rotation.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 gap-2 text-muted-foreground text-sm">
                  <Package className="h-8 w-8 text-border" />
                  <p>Sin ventas en el período seleccionado</p>
                  <button onClick={() => applyQuick('Todo')} className="text-primary text-xs underline">Ver todo el historial</button>
                </div>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rotation} layout="vertical" margin={{ left: 8, right: 20, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130}
                        tickFormatter={(v: string) => v.length > 18 ? v.slice(0,16)+'…' : v} />
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }}
                        formatter={(v: number) => [`${v} unidades`, 'Vendidas']} />
                      <Bar dataKey="units" fill="#0d9f6e" radius={[0, 6, 6, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facturación por rubro */}
          <Card>
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="font-bold">Revenue por rubro</h3>
            </div>
            <CardContent className="pt-4">
              {rubLoading ? (
                <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">Cargando…</div>
              ) : rubros.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 gap-2 text-muted-foreground text-sm">
                  <ShoppingBag className="h-8 w-8 text-border" />
                  <p>Sin ventas en el período seleccionado</p>
                </div>
              ) : (
                <>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rubros} margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="rubro" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.length > 8 ? v.slice(0,7)+'.' : v} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={42} />
                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [money(v), 'Facturado']} />
                        <Bar dataKey="revenue" radius={[6,6,0,0]} barSize={28}>
                          {rubros.map((r: any) => <Cell key={r.rubro} fill={RUBRO_COLORS[r.rubro] ?? '#888'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {rubros.map((r: any) => (
                      <div key={r.rubro} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="h-2 w-2 rounded-full" style={{ background: RUBRO_COLORS[r.rubro] ?? '#888' }} />
                          {r.rubro}
                        </span>
                        <div className="flex gap-3 font-mono">
                          <span className="text-muted-foreground">{r.units} u.</span>
                          <span className="font-semibold">{money(n(r.revenue))}</span>
                          <span className="text-primary">{money(n(r.ganancia))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historial de ventas */}
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5 flex-wrap gap-2">
            <h3 className="font-bold">Historial de ventas</h3>
            <span className="text-sm text-muted-foreground">{histTotal} registros en total</span>
          </div>

          {histLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Cargando ventas…</div>
          ) : salesData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground text-sm">
              <DollarSign className="h-8 w-8 text-border" />
              <p>No hay ventas en el período seleccionado</p>
              <button onClick={() => applyQuick('Todo')} className="text-primary text-xs underline">Ver todo el historial</button>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                {salesData.map((sale: any) => {
                  const saleTotal = n(sale.total);
                  const ganancia = (sale.lines ?? []).reduce((s: number, l: any) =>
                    s + (n(l.subtotal) - n(l.costUnit) * l.quantity), 0);
                  return (
                    <div key={sale.id} className="flex items-start justify-between px-5 py-3 hover:bg-muted/30 text-sm">
                      <div>
                        <p className="font-semibold">
                          #{String(sale.orderNumber).padStart(4, '0')}
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${sale.type === 'CREDIT' ? 'bg-violet-100 text-violet-700' : 'bg-primary/10 text-primary'}`}>
                            {sale.type === 'CREDIT' ? 'Fiado' : 'Contado'}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {fdate(sale.createdAt)} {ftime(sale.createdAt)} · {sale.user?.name}
                          {sale.customer && ` · ${sale.customer.name}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">{money(saleTotal)}</p>
                        {ganancia > 0 && <p className="text-xs text-primary font-mono">+{money(Math.round(ganancia))}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginación */}
              {histTotal > 50 && (
                <div className="flex items-center justify-between border-t border-border px-5 py-3">
                  <button
                    disabled={histPage === 1}
                    onClick={() => setHistPage(p => p - 1)}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-40 hover:bg-muted"
                  >
                    ← Anterior
                  </button>
                  <span className="text-xs text-muted-foreground">
                    Página {histPage} de {Math.ceil(histTotal / 50)}
                  </span>
                  <button
                    disabled={histPage >= Math.ceil(histTotal / 50)}
                    onClick={() => setHistPage(p => p + 1)}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-40 hover:bg-muted"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
