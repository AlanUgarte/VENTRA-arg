'use client';
import { useAdminActivity } from '@/hooks/use-admin';
import { money, fdate, ftime } from '@/lib/utils';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    'text-emerald-400 bg-emerald-500/10',
  TRIAL:     'text-yellow-400 bg-yellow-500/10',
  PAST_DUE:  'text-orange-400 bg-orange-500/10',
  CANCELLED: 'text-red-400 bg-red-500/10',
};

export default function AdminActivityPage() {
  const { data: activity } = useAdminActivity();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Actividad reciente</h1>
        <p className="text-sm text-white/40 mt-0.5">Últimos registros y ventas en toda la plataforma</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-bold text-white mb-4">Últimos negocios registrados</h3>
          <div className="space-y-3">
            {(activity?.recentTenants ?? []).map((t: any) => (
              <div key={t.id} className="flex items-start justify-between py-2 border-b border-white/5">
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{fdate(t.createdAt)} {ftime(t.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${STATUS_STYLE[t.subscription?.status] ?? ''}`}>
                    {t.subscription?.status}
                  </span>
                  <span className="text-xs text-white/30">{t.subscription?.plan}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-bold text-white mb-4">Últimas ventas (toda la plataforma)</h3>
          <div className="space-y-3">
            {(activity?.recentSales ?? []).map((s: any) => (
              <div key={s.id} className="flex items-start justify-between py-2 border-b border-white/5">
                <div>
                  <p className="font-semibold text-white">{s.tenant?.name}</p>
                  <p className="text-xs text-white/40">
                    #{String(s.orderNumber).padStart(4, '0')} · {s.user?.name}
                  </p>
                  <p className="text-xs text-white/30">{fdate(s.createdAt)} {ftime(s.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono font-bold text-emerald-400">{money(Number(s.total))}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.type === 'CASH' ? 'text-blue-400 bg-blue-500/10' : 'text-violet-400 bg-violet-500/10'}`}>
                    {s.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
