'use client';
import { useAdminRevenue, useAdminStats } from '@/hooks/use-admin';
import { money } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react';

export default function AdminRevenuePage() {
  const { data: revenue = [] } = useAdminRevenue();
  const { data: stats } = useAdminStats();

  const lastMonth = revenue[revenue.length - 1]?.mrr ?? 0;
  const prevMonth = revenue[revenue.length - 2]?.mrr ?? 0;
  const growth = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Revenue</h1>
        <p className="text-sm text-white/40 mt-0.5">Ingresos y métricas financieras</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'MRR actual', value: money(stats?.mrr ?? 0), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'ARR proyectado', value: money((stats?.mrr ?? 0) * 12), icon: Target, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Crecimiento MoM', value: `${growth >= 0 ? '+' : ''}${growth}%`, icon: TrendingUp, color: growth >= 0 ? 'text-emerald-400' : 'text-red-400', bg: growth >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
          { label: 'Pagadores activos', value: stats?.activeSubs ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${kpi.bg}`}>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <p className="text-xs text-white/40">{kpi.label}</p>
            <p className={`font-mono text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="font-bold text-white mb-5">Evolución del MRR</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={(v: number) => [money(v), 'MRR']}
              />
              <Area type="monotone" dataKey="mrr" stroke="#8b5cf6" strokeWidth={2}
                fill="url(#mrrGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {['Mes', 'MRR', 'Suscriptores', 'Crecimiento'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-white/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...revenue].reverse().map((r: any, i: number) => {
              const prev = revenue[revenue.length - 2 - i];
              const g = prev && prev.mrr > 0 ? Math.round(((r.mrr - prev.mrr) / prev.mrr) * 100) : null;
              return (
                <tr key={r.month} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-5 py-3 font-semibold text-white">{r.month}</td>
                  <td className="px-5 py-3 font-mono text-emerald-400 font-bold">{money(r.mrr)}</td>
                  <td className="px-5 py-3 text-white/60">{r.subscribers}</td>
                  <td className="px-5 py-3">
                    {g !== null && (
                      <span className={`text-xs font-bold ${g >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {g >= 0 ? '+' : ''}{g}%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
