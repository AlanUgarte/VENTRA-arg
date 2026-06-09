'use client';
export const dynamic = 'force-dynamic';
import { useAdminPlanStats, useAdminStats } from '@/hooks/use-admin';
import { money } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const PLAN_COLORS: Record<string, string> = {
  PRO:        '#10b981',
  ENTERPRISE: '#8b5cf6',
  TRIAL:      '#eab308',
};

const PLAN_NAMES: Record<string, string> = {
  PRO:        'Plan Completo',
  ENTERPRISE: 'Plan Enterprise',
  TRIAL:      'Período de prueba',
};

export default function AdminPlansPage() {
  const { data: planStats } = useAdminPlanStats();
  const { data: stats } = useAdminStats();

  const distribution = planStats?.distribution ?? [];
  const total = planStats?.total ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Planes</h1>
        <p className="text-sm text-white/40 mt-0.5">Distribución y performance por plan</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-3 gap-4">
        {distribution.map((p: any) => (
          <div key={p.plan} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">{PLAN_NAMES[p.plan] ?? p.plan}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${PLAN_COLORS[p.plan]}22`, color: PLAN_COLORS[p.plan] }}
              >
                {p.plan}
              </span>
            </div>
            <p className="font-mono text-3xl font-bold text-white">{p.subscribers}</p>
            <p className="text-xs text-white/40 mt-0.5">suscriptores activos</p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-white/40">Revenue mensual</p>
              <p className="font-mono font-bold text-emerald-400">{money(p.monthlyRevenue)}</p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-white/40">Precio unitario</p>
              <p className="font-mono text-white/60">{money(p.pricePerUnit)}/mes</p>
            </div>
            {total > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>Participación</span>
                  <span>{Math.round((p.subscribers / total) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((p.subscribers / total) * 100)}%`,
                      background: PLAN_COLORS[p.plan],
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-bold text-white mb-4">Suscriptores por plan</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="subscribers" nameKey="plan"
                  cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
                  {distribution.map((p: any) => (
                    <Cell key={p.plan} fill={PLAN_COLORS[p.plan] ?? '#888'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: number, name: string) => [v + ' suscriptores', PLAN_NAMES[name] ?? name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-bold text-white mb-4">Revenue por plan</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="plan" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: number) => [money(v), 'Revenue']}
                />
                <Bar dataKey="monthlyRevenue" radius={[6, 6, 0, 0]}>
                  {distribution.map((p: any) => (
                    <Cell key={p.plan} fill={PLAN_COLORS[p.plan] ?? '#888'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="font-bold text-white mb-3">Resumen financiero</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white/40">MRR total</p>
            <p className="font-mono font-bold text-emerald-400 text-lg">{money(stats?.mrr ?? 0)}</p>
          </div>
          <div>
            <p className="text-white/40">ARR proyectado</p>
            <p className="font-mono font-bold text-violet-400 text-lg">{money((stats?.mrr ?? 0) * 12)}</p>
          </div>
          <div>
            <p className="text-white/40">Suscriptores activos</p>
            <p className="font-mono font-bold text-blue-400 text-lg">{stats?.activeSubs ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
