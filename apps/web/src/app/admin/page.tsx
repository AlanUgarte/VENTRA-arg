'use client';
import { useAdminStats, useAdminRevenue, useAdminActivity } from '@/hooks/use-admin';
import { money, fdate } from '@/lib/utils';
import {
  Building2, Users, TrendingUp, DollarSign,
  UserCheck, UserX, RefreshCw, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const PLAN_COLORS: Record<string, string> = {
  PRO:        '#10b981',
  ENTERPRISE: '#8b5cf6',
  TRIAL:      '#6b7280',
};

function StatCard({
  label, value, sub, icon: Icon, color = 'text-violet-400', bg = 'bg-violet-500/10',
}: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="text-xs font-semibold text-white/50">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats } = useAdminStats();
  const { data: revenue = [] } = useAdminRevenue();
  const { data: activity } = useAdminActivity();

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-0.5">Vista general de VENTRA ARG</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="MRR" value={money(stats?.mrr ?? 0)}
          icon={DollarSign} color="text-emerald-400" bg="bg-emerald-500/10"
          sub={`${stats?.activeSubs ?? 0} suscriptores activos`}
        />
        <StatCard
          label="Negocios registrados" value={stats?.totalTenants ?? 0}
          icon={Building2} color="text-blue-400" bg="bg-blue-500/10"
          sub={`+${stats?.newThisMonth ?? 0} este mes (${stats?.growthPct >= 0 ? '+' : ''}${stats?.growthPct ?? 0}%)`}
        />
        <StatCard
          label="En prueba" value={stats?.trialSubs ?? 0}
          icon={RefreshCw} color="text-yellow-400" bg="bg-yellow-500/10"
          sub="Período de trial activo"
        />
        <StatCard
          label="Cancelados" value={stats?.cancelledSubs ?? 0}
          icon={UserX} color="text-red-400" bg="bg-red-500/10"
          sub={`${stats?.pastDueSubs ?? 0} con pago pendiente`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Usuarios totales" value={stats?.totalUsers ?? 0}
          icon={Users} color="text-violet-400" bg="bg-violet-500/10"
        />
        <StatCard
          label="Ventas procesadas" value={stats?.totalSales ?? 0}
          icon={Activity} color="text-cyan-400" bg="bg-cyan-500/10"
          sub="En todos los negocios"
        />
        <StatCard
          label="Activos pagos" value={stats?.activeSubs ?? 0}
          icon={UserCheck} color="text-emerald-400" bg="bg-emerald-500/10"
          sub="Suscripciones ACTIVE"
        />
        <StatCard
          label="ARR estimado" value={money((stats?.mrr ?? 0) * 12)}
          icon={TrendingUp} color="text-pink-400" bg="bg-pink-500/10"
          sub="Ingresos anuales proyectados"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Revenue timeline */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-bold text-white mb-4">MRR últimos 6 meses</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: number) => [money(v), 'MRR']}
                />
                <Bar dataKey="mrr" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan distribution */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-bold text-white mb-4">Distribución de planes</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.planDistribution?.filter((p: any) => p.status === 'ACTIVE' || p.status === 'TRIAL') ?? []}
                  dataKey="count" nameKey="plan" cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                >
                  {(stats?.planDistribution ?? []).map((entry: any, i: number) => (
                    <Cell key={i} fill={PLAN_COLORS[entry.plan] ?? '#888'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: number, name: string) => [v, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {Object.entries(PLAN_COLORS).map(([plan, color]) => (
              <span key={plan} className="flex items-center gap-1 text-xs text-white/50">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                {plan}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-bold text-white mb-3">Últimos negocios registrados</h3>
          <div className="space-y-2">
            {(activity?.recentTenants ?? []).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{fdate(t.createdAt)}</p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: t.subscription?.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' :
                      t.subscription?.status === 'TRIAL' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                    color: t.subscription?.status === 'ACTIVE' ? '#10b981' :
                      t.subscription?.status === 'TRIAL' ? '#eab308' : '#ef4444',
                  }}
                >
                  {t.subscription?.plan ?? 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-bold text-white mb-3">Últimas ventas (todos los negocios)</h3>
          <div className="space-y-2">
            {(activity?.recentSales ?? []).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">{s.tenant?.name}</p>
                  <p className="text-xs text-white/40">#{String(s.orderNumber).padStart(4, '0')} · {s.user?.name} · {fdate(s.createdAt)}</p>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-400">{money(Number(s.total))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
