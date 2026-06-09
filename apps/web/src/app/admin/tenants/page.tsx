'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Search, CheckCircle, XCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdminTenants, useSetTenantStatus, useBlockTenant, useDeleteTenant, useTenantUsers, useUpdateTenantUser, useDeleteTenantUser } from '@/hooks/use-admin';
import { fdate } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    'text-emerald-400 bg-emerald-500/10',
  TRIAL:     'text-yellow-400 bg-yellow-500/10',
  PAST_DUE:  'text-orange-400 bg-orange-500/10',
  CANCELLED: 'text-red-400 bg-red-500/10',
};
const PLAN_STYLE: Record<string, string> = {
  PRO:        'text-emerald-400 bg-emerald-500/10',
  ENTERPRISE: 'text-violet-400 bg-violet-500/10',
  TRIAL:      'text-gray-400 bg-gray-500/10',
};

function TenantUsersRow({ tenantId }: { tenantId: string }) {
  const { data: users = [], isLoading } = useTenantUsers(tenantId);
  const updateUser = useUpdateTenantUser();
  const deleteUser = useDeleteTenantUser();

  if (isLoading) return <div className="px-4 py-3 text-xs text-white/40">Cargando usuarios…</div>;
  if (!users.length) return <div className="px-4 py-3 text-xs text-white/40">Sin usuarios registrados</div>;

  return (
    <div className="divide-y divide-white/5">
      {users.map((u) => (
        <div key={u.id} className="flex items-center gap-3 px-4 py-2.5">
          <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${u.isActive ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'}`}>
            {u.name.slice(0,1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${u.isActive ? 'text-white' : 'text-white/40'}`}>{u.name}</p>
            <p className="text-[10px] text-white/30 truncate">{u.email} · {u.role}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${u.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {u.isActive ? 'Activo' : 'Suspendido'}
            </span>
            {u.role !== 'OWNER' && (
              <>
                <button onClick={() => updateUser.mutate({ tenantId, userId: u.id, isActive: !u.isActive })}
                  title={u.isActive ? 'Suspender' : 'Activar'}
                  className="rounded-lg p-1 text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                  {u.isActive ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => { if(confirm(`¿Eliminar a ${u.name}?`)) deleteUser.mutate({ tenantId, userId: u.id }); }}
                  title="Eliminar"
                  className="rounded-lg p-1 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminTenantsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionTenant, setActionTenant] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPlan, setNewPlan] = useState('');
  const [reason, setReason] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useAdminTenants(search || undefined, statusFilter || undefined, page);
  const setStatus = useSetTenantStatus();
  const blockMutation = useBlockTenant();
  const deleteMutation = useDeleteTenant();

  const openAction = (t: any) => { setActionTenant(t); setNewStatus(t.subscription?.status ?? 'TRIAL'); setNewPlan(t.subscription?.plan ?? 'TRIAL'); setReason(''); };

  const handleStatusChange = async () => {
    if (!actionTenant) return;
    try { await setStatus.mutateAsync({ id: actionTenant.id, status: newStatus, plan: newPlan, reason }); toast.success('Actualizado'); setActionTenant(null); }
    catch (err: any) { toast.error(err.response?.data?.message ?? 'Error'); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿ELIMINAR "${name}" y TODOS sus datos? IRREVERSIBLE.`)) return;
    try { await deleteMutation.mutateAsync(id); toast.success('Negocio eliminado'); }
    catch (err: any) { toast.error(err.response?.data?.message ?? 'Error'); }
  };

  const tenants = data?.data ?? [];

  return (
    <div className="p-3 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Negocios</h1>
        <p className="text-sm text-white/40 mt-0.5">{data?.total ?? 0} registrados</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500"
            placeholder="Buscar por nombre o email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Todos los estados</option>
          <option value="TRIAL">Trial</option>
          <option value="ACTIVE">Activo</option>
          <option value="PAST_DUE">Pago pendiente</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-white/30 text-sm">Cargando…</div>
        ) : !tenants.length ? (
          <div className="p-8 text-center text-white/30 text-sm">Sin resultados</div>
        ) : (
          <div className="divide-y divide-white/10">
            {tenants.map((t: any) => (
              <div key={t.id}>
                <div className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-white font-bold">
                        {t.name.slice(0,1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{t.name}</p>
                        <p className="text-xs text-white/40 truncate">{t.users?.[0]?.name} · {t.users?.[0]?.email}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PLAN_STYLE[t.subscription?.plan] ?? ''}`}>{t.subscription?.plan}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[t.subscription?.status] ?? ''}`}>{t.subscription?.status}</span>
                          <span className="text-[10px] text-white/30">{t._count?.users ?? 0} usuarios · {t._count?.sales ?? 0} ventas · {fdate(t.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <button onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                      className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10 transition-colors">
                      {expandedId === t.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      Ver usuarios ({t._count?.users ?? 0})
                    </button>
                    <button onClick={() => openAction(t)}
                      className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10 transition-colors">
                      ⚙ Plan / Estado
                    </button>
                    <button onClick={() => blockMutation.mutate({ id: t.id, block: true })}
                      className="rounded-xl border border-orange-500/20 px-3 py-1.5 text-xs font-semibold text-orange-400 hover:bg-orange-500/10 transition-colors">
                      Bloquear todo
                    </button>
                    <button onClick={() => handleDelete(t.id, t.name)}
                      className="rounded-xl border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                      Eliminar negocio
                    </button>
                  </div>
                </div>

                {/* Usuarios expandibles */}
                {expandedId === t.id && (
                  <div className="border-t border-white/10 bg-black/20">
                    <div className="px-4 py-2 border-b border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-white/30">
                        Usuarios — Activo = puede ingresar · Suspendido = bloqueado
                      </span>
                    </div>
                    <TenantUsersRow tenantId={t.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {data && data.total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p-1)} className="border-white/10 text-white/50 hover:bg-white/5">← Anterior</Button>
          <span className="flex items-center text-sm text-white/40">Pág. {page} / {Math.ceil(data.total/20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total/20)} onClick={() => setPage(p => p+1)} className="border-white/10 text-white/50 hover:bg-white/5">Siguiente →</Button>
        </div>
      )}

      <Dialog open={!!actionTenant} onOpenChange={() => setActionTenant(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader><DialogTitle className="text-white">Gestionar — {actionTenant?.name}</DialogTitle></DialogHeader>
          <DialogBody className="space-y-3">
            <div>
              <Label className="text-white/50 text-xs">Plan</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  {[{v:'TRIAL',l:'TRIAL'},{v:'PRO',l:'PRO — $24.990/mes'},{v:'ENTERPRISE',l:'ENTERPRISE — $75.000/mes'}].map(p =>
                    <SelectItem key={p.v} value={p.v} className="text-white focus:bg-white/10">{p.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/50 text-xs">Estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  {[{v:'ACTIVE',l:'ACTIVE'},{v:'TRIAL',l:'TRIAL'},{v:'PAST_DUE',l:'PAST_DUE'},{v:'CANCELLED',l:'CANCELLED'}].map(s =>
                    <SelectItem key={s.v} value={s.v} className="text-white focus:bg-white/10">{s.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/50 text-xs">Motivo (opcional)</Label>
              <Input className="bg-white/5 border-white/10 text-white mt-1" placeholder="Ej: Pago manual recibido…" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={handleStatusChange} disabled={setStatus.isPending}>Aplicar</Button>
              <Button variant="ghost" className="text-white/50" onClick={() => setActionTenant(null)}>Cancelar</Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
