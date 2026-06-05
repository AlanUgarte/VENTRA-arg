'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Save, Building2, CreditCard, AlertTriangle, Download } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { fdate } from '@/lib/utils';
import api from '@/lib/api';

const STATUS_LABEL: Record<string, string> = {
  TRIAL: 'Período de prueba', ACTIVE: 'Activa',
  PAST_DUE: 'Pago pendiente', CANCELLED: 'Cancelada',
};
const STATUS_VARIANT: Record<string, any> = {
  TRIAL: 'warning', ACTIVE: 'success', PAST_DUE: 'destructive', CANCELLED: 'outline',
};

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const sub     = user?.tenant?.subscription;
  const isOwner = user?.role === 'OWNER';

  const [name,    setName]    = useState(user?.tenant?.name    ?? '');
  const [phone,   setPhone]   = useState(user?.tenant?.phone   ?? '');
  const [address, setAddress] = useState(user?.tenant?.address ?? '');
  const [taxId,   setTaxId]   = useState(user?.tenant?.taxId   ?? '');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    setName(user?.tenant?.name ?? '');
    setPhone(user?.tenant?.phone ?? '');
    setAddress(user?.tenant?.address ?? '');
    setTaxId(user?.tenant?.taxId ?? '');
  }, [user?.tenant]);

  const trialDaysLeft = sub?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.patch('/tenants/me', { name: name.trim(), phone, address, taxId });
      // Update auth store
      if (user) {
        setUser({ ...user, tenant: { ...user.tenant, ...data } });
      }
      toast.success('Datos del negocio actualizados');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const downloadCSV = async (endpoint: string, filename: string, params?: string) => {
    try {
      const url = `/reports/export/${endpoint}${params ? '?' + params : ''}`;
      const { data } = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(`${filename} descargado`);
    } catch {
      toast.error('Error al exportar');
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Configuración" subtitle="Datos del negocio, suscripción y exportaciones" />

      <div className="p-3 md:p-5 max-w-2xl space-y-5">

        {/* Banners trial */}
        {sub?.status === 'TRIAL' && trialDaysLeft === 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Tu período de prueba venció</p>
              <p className="text-sm">Activá un plan para seguir usando el sistema.</p>
            </div>
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0">
              <Link href="/billing">Ver planes</Link>
            </Button>
          </div>
        )}
        {sub?.status === 'TRIAL' && trialDaysLeft > 0 && trialDaysLeft <= 2 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Tu prueba vence en {trialDaysLeft} día{trialDaysLeft !== 1 ? 's' : ''}</p>
              <p className="text-sm">Elegí un plan para no perder el acceso.</p>
            </div>
            <Button asChild size="sm" className="flex-shrink-0"><Link href="/billing">Ver planes</Link></Button>
          </div>
        )}

        {/* Datos del negocio */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-base">Datos del negocio</h2>
              <span className="ml-auto text-xs text-muted-foreground">Aparecen en el ticket de venta</span>
            </div>

            <form onSubmit={handleSaveBusiness} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="biz-name">Nombre del negocio *</Label>
                  <Input
                    id="biz-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej: Kiosco El Sol"
                    required
                    disabled={!isOwner}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="biz-phone">Teléfono</Label>
                  <Input
                    id="biz-phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Ej: 341-555-1234"
                    disabled={!isOwner}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="biz-taxid">CUIT / DNI</Label>
                  <Input
                    id="biz-taxid"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    placeholder="Ej: 20-12345678-9"
                    disabled={!isOwner}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="biz-address">Dirección</Label>
                  <Input
                    id="biz-address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Ej: Av. Mitre 1234, Rosario"
                    disabled={!isOwner}
                  />
                </div>
              </div>

              {isOwner && (
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : <><Save className="mr-2 h-4 w-4" />Guardar cambios</>}
                </Button>
              )}
              {!isOwner && (
                <p className="text-xs text-muted-foreground">Solo el dueño puede editar los datos del negocio.</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Suscripción */}
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-base">Suscripción</h2>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/billing">Gestionar</Link>
              </Button>
            </div>
            {sub && (
              <div className="grid grid-cols-2 gap-3 text-sm pt-1">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Plan</p>
                  <p className="font-bold">{sub.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Estado</p>
                  <Badge variant={STATUS_VARIANT[sub.status]}>{STATUS_LABEL[sub.status]}</Badge>
                </div>
                {sub.status === 'TRIAL' && trialDaysLeft > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Prueba hasta</p>
                    <p className="font-semibold">{fdate(sub.trialEndsAt)}</p>
                  </div>
                )}
                {sub.status === 'ACTIVE' && sub.currentPeriodEnd && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Próximo cobro</p>
                    <p className="font-semibold">{fdate(sub.currentPeriodEnd)}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exportación de respaldos */}
        {isOwner && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Download className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-base">Exportación de respaldos</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Descargá tus datos en formato CSV para abrirlos en Excel, Google Sheets o guardarlos como respaldo.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  onClick={() => downloadCSV('ventas', 'ventas.csv')}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-muted/30 p-4 text-center hover:bg-muted/60 transition-colors cursor-pointer"
                >
                  <span className="text-2xl">📊</span>
                  <span className="font-bold text-sm">Ventas</span>
                  <span className="text-xs text-muted-foreground">Historial completo con detalle de cada venta</span>
                </button>
                <button
                  onClick={() => downloadCSV('inventario', 'inventario.csv')}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-muted/30 p-4 text-center hover:bg-muted/60 transition-colors cursor-pointer"
                >
                  <span className="text-2xl">📦</span>
                  <span className="font-bold text-sm">Inventario</span>
                  <span className="text-xs text-muted-foreground">Todos los productos con precios y stock</span>
                </button>
                <button
                  onClick={() => downloadCSV('clientes', 'clientes.csv')}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-muted/30 p-4 text-center hover:bg-muted/60 transition-colors cursor-pointer"
                >
                  <span className="text-2xl">👥</span>
                  <span className="font-bold text-sm">Clientes</span>
                  <span className="text-xs text-muted-foreground">Lista de clientes con pagos registrados</span>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
