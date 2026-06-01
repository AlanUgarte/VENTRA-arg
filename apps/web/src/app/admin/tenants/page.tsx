'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Search, Building2, MoreHorizontal, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { useAdminTenants, useSetTenantStatus, useBlockTenant, useDeleteTenant } from '@/hooks/use-admin';
import { money, fdate } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:     'text-emerald-400 bg-emerald-500/10',
  TRIAL:      'text-yellow-400 bg-yellow-500/10',
  PAST_DUE:   'text-orange-400 bg-orange-500/10',
  CANCELLED:  'text-red-400 bg-red-500/10',
};

const PLAN_STYLE: Record<string, string> = {
  BASIC:      'text-blue-400 bg-blue-500/10',
  PRO:        'text-emerald-400 bg-emerald-500/10',
  ENTERPRISE: 'text-violet-400 bg-violet-500/10',
  TRIAL:      'text-gray-400 bg-gray-500/10',
};

export default function AdminTenantsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionTenant, setActionTenant] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');

  const { data, isLoading } = useAdminTenants(search || undefined, statusFilter || undefined, page);
  const setStatus = useSetTenantStatus();
  const blockMutation = useBlockTenant();
  const deleteMutation = useDeleteTenant();

  const handleStatusChange = async () => {
    if (!actionTenant || !newStatus) return;
    try {
      await setStatus.mutateAsync({ id: actionTenant.id, status: newStatus, reason });
      toast.success(`Estado cambiado a ${newStatus}`);
      setActionTenant(null);
      setReason('');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error');
    }
  };

  const handleBlock = async (id: string, block: boolean, name: string) => {
    if (!confirm(`¿${block ? 'Bloquear' : 'Desbloquear'} todos los usuarios de "${name}"?`)) return;
    await blockMutation.mutateAsync({ id, block });
    toast.success(block ? 'Usuarios bloqueados' : 'Usuarios desbloqueados');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿ELIMINAR el negocio "${name}" y todos sus datos? Esta acción es IRREVERSIBLE.`)) return;
    await deleteMutation.mutateAsync(id);
    toast.success('Negocio eliminado');
  };

  const tenants = data?.data ?? [];

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Negocios</h1>
        <p className="text-sm text-white/40 mt-0.5">
          {data?.total ?? 0} negocios registrados
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Todos los estados</option>
          <option value="TRIAL">Trial</option>
          <option value="ACTIVE">Activo</option>
          <option value="PAST_DUE">Pago pendiente</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {['Negocio', 'Owner', 'Plan', 'Estado', 'Usuarios', 'Ventas', 'Registrado', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-white/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-white/30">Cargando...</td></tr>
            ) : !tenants.length ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-white/30">Sin resultados</td></tr>
            ) : tenants.map((t: any) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/30">{t.slug}</p>
                </td>
                <td className="px-4 py-3 text-white/60 text-xs">
                  {t.users?.[0]?.name}<br/>
                  <span className="text-white/30">{t.users?.[0]?.email}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${PLAN_STYLE[t.subscription?.plan] ?? 'text-gray-400 bg-gray-500/10'}`}>
                    {t.subscription?.plan ?? 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLE[t.subscription?.status] ?? ''}`}>
                    {t.subscription?.status ?? 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/60">{t._count?.users ?? 0}</td>
                <td className="px-4 py-3 text-white/60">{t._count?.sales ?? 0}</td>
                <td className="px-4 py-3 text-white/40 text-xs">{fdate(t.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button
                      className="rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-white transition-colors"
                      title="Cambiar estado"
                      onClick={() => { setActionTenant(t); setNewStatus(t.subscription?.status ?? 'ACTIVE'); }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-white/30 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                      title="Activar usuarios"
                      onClick={() => handleBlock(t.id, false, t.name)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-white/30 hover:bg-orange-500/10 hover:text-orange-400 transition-colors"
                      title="Bloquear usuarios"
                      onClick={() => handleBlock(t.id, true, t.name)}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Eliminar negocio"
                      onClick={() => handleDelete(t.id, t.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="border-white/10 text-white/50 hover:bg-white/5">
            Anterior
          </Button>
          <span className="flex items-center text-sm text-white/40">
            Página {page} de {Math.ceil(data.total / 20)}
          </span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)}
            className="border-white/10 text-white/50 hover:bg-white/5">
            Siguiente
          </Button>
        </div>
      )}

      {/* Status modal */}
      <Dialog open={!!actionTenant} onOpenChange={() => setActionTenant(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Cambiar estado — {actionTenant?.name}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-1.5">Nuevo estado</label>
              <select
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE — Suscripción activa</option>
                <option value="TRIAL">TRIAL — En período de prueba</option>
                <option value="PAST_DUE">PAST_DUE — Pago pendiente</option>
                <option value="CANCELLED">CANCELLED — Cancelado</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-1.5">Motivo (opcional)</label>
              <Input
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                placeholder="Ej: Pago manual recibido, suspensión por falta de pago..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={handleStatusChange} disabled={setStatus.isPending}>
                Aplicar cambio
              </Button>
              <Button variant="ghost" className="text-white/50 hover:bg-white/5" onClick={() => setActionTenant(null)}>
                Cancelar
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
