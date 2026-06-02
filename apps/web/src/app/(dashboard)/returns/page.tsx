'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, CheckCircle, XCircle, Clock, PackageX } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/shared/kpi-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSuppliers } from '@/hooks/use-suppliers';
import { useProducts } from '@/hooks/use-products';
import { useReturns, useReturnStats, useCreateReturn, useUpdateReturn, useDeleteReturn } from '@/hooks/use-returns';
import { fdate } from '@/lib/utils';

const REASONS = [
  { value: 'BROKEN',     label: '🔨 Rotura' },
  { value: 'EXPIRED',    label: '📅 Vencimiento' },
  { value: 'DEFECTIVE',  label: '⚠️ Defecto de fábrica' },
  { value: 'WRONG_ITEM', label: '📦 Artículo incorrecto' },
  { value: 'OTHER',      label: '📝 Otro motivo' },
];

const STATUS_INFO: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:  { label: 'Pendiente',    color: 'warning',     icon: Clock },
  CREDITED: { label: 'Acreditado',  color: 'success',     icon: CheckCircle },
  REPLACED: { label: 'Repuesto',    color: 'blue',        icon: CheckCircle },
  REJECTED: { label: 'Rechazado',   color: 'destructive', icon: XCircle },
};

const schema = z.object({
  supplierId:   z.string().min(1, 'Seleccioná un proveedor'),
  productName:  z.string().min(2, 'Ingresá el nombre del artículo'),
  productId:    z.string().optional(),
  quantity:     z.coerce.number().int().min(1),
  reason:       z.string().min(1, 'Seleccioná el motivo'),
  reasonDetail: z.string().optional(),
  notes:        z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ReturnsPage() {
  const [showNew, setShowNew] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveStatus, setResolveStatus] = useState('CREDITED');
  const [creditAmount, setCreditAmount] = useState('');

  const { data: stats } = useReturnStats();
  const { data: returns = [], isLoading } = useReturns(filterSupplier || undefined, filterStatus || undefined);
  const { data: suppliers = [] } = useSuppliers();
  const { data: products = [] } = useProducts();
  const createReturn = useCreateReturn();
  const updateReturn = useUpdateReturn();
  const deleteReturn = useDeleteReturn();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1 },
  });

  const selectedSupplierId = watch('supplierId');

  const onSubmit = async (values: FormValues) => {
    try {
      const { supplierId, ...rest } = values;
      await createReturn.mutateAsync({ supplierId, ...rest });
      toast.success('Devolución registrada');
      setShowNew(false);
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error al registrar');
    }
  };

  const handleResolve = async () => {
    if (!resolveId) return;
    try {
      await updateReturn.mutateAsync({
        id: resolveId,
        status: resolveStatus,
        ...(resolveStatus === 'CREDITED' && creditAmount ? { creditAmount: Number(creditAmount) } : {}),
      });
      toast.success('Estado actualizado');
      setResolveId(null);
      setCreditAmount('');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta devolución del registro?')) return;
    await deleteReturn.mutateAsync(id);
    toast.success('Registro eliminado');
  };

  const filtered = returns.filter((r: any) => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterSupplier && r.supplierId !== filterSupplier) return false;
    return true;
  });

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Devoluciones a Proveedores" subtitle="Trazabilidad de artículos devueltos por roturas u otros motivos" />

      <div className="p-3 md:p-5 space-y-4">

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Total devuelto"   value={String(stats?.total ?? 0)}              icon={PackageX}    color="text-orange-500" bg="bg-orange-100" sub={`${stats?.totalUnitsReturned ?? 0} unidades`} />
          <KpiCard label="Pendientes"        value={String(stats?.pending ?? 0)}             icon={Clock}       color="text-yellow-600" bg="bg-yellow-100" sub="Esperando resolución" />
          <KpiCard label="Acreditados"       value={String(stats?.credited ?? 0)}            icon={CheckCircle} sub="Proveedor acreditó" />
          <KpiCard label="Monto acreditado"  value={`$${(stats?.totalCredited ?? 0).toLocaleString('es-AR')}`} icon={CheckCircle} color="text-primary" sub="Total recuperado" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" /> Registrar devolución
          </Button>
          <select
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="CREDITED">Acreditados</option>
            <option value="REPLACED">Repuestos</option>
            <option value="REJECTED">Rechazados</option>
          </select>
          <select
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
          >
            <option value="">Todos los proveedores</option>
            {suppliers.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <Card>
          <div className="border-b border-border px-5 py-3.5">
            <h3 className="font-bold">Historial de devoluciones</h3>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Cargando…</div>
          ) : !filtered.length ? (
            <EmptyState icon={PackageX} title="Sin devoluciones" description="Registrá la primera devolución a un proveedor" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Proveedor', 'Artículo', 'Cant.', 'Motivo', 'Estado', 'Fecha', 'Monto cred.', ''].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r: any) => {
                    const info = STATUS_INFO[r.status] ?? STATUS_INFO['PENDING'];
                    const reasonLabel = REASONS.find(x => x.value === r.reason)?.label ?? r.reason;
                    return (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-4 py-2.5 font-semibold">{r.supplier?.name}</td>
                        <td className="px-4 py-2.5">
                          <p className="font-medium">{r.productName}</p>
                          {r.reasonDetail && <p className="text-xs text-muted-foreground">{r.reasonDetail}</p>}
                        </td>
                        <td className="px-4 py-2.5 font-mono">{r.quantity}</td>
                        <td className="px-4 py-2.5 text-xs">{reasonLabel}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant={info.color as any}>{info.label}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{fdate(r.returnedAt)}</td>
                        <td className="px-4 py-2.5 font-mono text-primary text-xs">
                          {r.creditAmount ? `$${Number(r.creditAmount).toLocaleString('es-AR')}` : '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1.5 justify-end">
                            {r.status === 'PENDING' && (
                              <Button size="sm" variant="outline" onClick={() => { setResolveId(r.id); setResolveStatus('CREDITED'); }}>
                                Resolver
                              </Button>
                            )}
                            <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              onClick={() => handleDelete(r.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Nueva devolución */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Registrar devolución a proveedor</DialogTitle></DialogHeader>
          <DialogBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Proveedor *</Label>
                <Select onValueChange={(v) => setValue('supplierId', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccioná el proveedor" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.supplierId && <p className="text-xs text-destructive">{errors.supplierId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Artículo devuelto *</Label>
                <Select onValueChange={(v) => {
                  const p = products.find((x: any) => x.id === v);
                  if (p) { setValue('productId', p.id); setValue('productName', (p as any).name); }
                }}>
                  <SelectTrigger><SelectValue placeholder="Elegí del inventario (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="O escribí el nombre del artículo" {...register('productName')} />
                {errors.productName && <p className="text-xs text-destructive">{errors.productName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Cantidad *</Label>
                  <Input type="number" min={1} {...register('quantity')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Motivo *</Label>
                  <Select onValueChange={(v) => setValue('reason', v)}>
                    <SelectTrigger><SelectValue placeholder="Motivo" /></SelectTrigger>
                    <SelectContent>
                      {REASONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Descripción adicional (opcional)</Label>
                <Input placeholder="Ej: Vidrio roto, fecha vencida, etc." {...register('reasonDetail')} />
              </div>

              <div className="space-y-1.5">
                <Label>Notas internas (opcional)</Label>
                <Input placeholder="Notas para tu registro" {...register('notes')} />
              </div>

              <Button type="submit" className="w-full" disabled={createReturn.isPending}>
                Registrar devolución
              </Button>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Resolver devolución */}
      <Dialog open={!!resolveId} onOpenChange={() => setResolveId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolver devolución</DialogTitle></DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1.5">
              <Label>Resultado</Label>
              <Select value={resolveStatus} onValueChange={setResolveStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREDITED">✅ Proveedor acreditó el monto</SelectItem>
                  <SelectItem value="REPLACED">🔄 Proveedor repuso el artículo</SelectItem>
                  <SelectItem value="REJECTED">❌ Proveedor rechazó la devolución</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {resolveStatus === 'CREDITED' && (
              <div className="space-y-1.5">
                <Label>Monto acreditado $ (opcional)</Label>
                <Input type="number" min={0} placeholder="0" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} />
              </div>
            )}
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleResolve} disabled={updateReturn.isPending}>Guardar</Button>
              <Button variant="outline" className="flex-1" onClick={() => setResolveId(null)}>Cancelar</Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
