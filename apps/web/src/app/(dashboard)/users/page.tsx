'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus, Trash2, ShieldCheck, Users } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fdate } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type FormValues = z.infer<typeof schema>;

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Dueño',
  ADMIN: 'Administrador',
  CASHIER: 'Empleado',
};

const CASHIER_PERMISSIONS = [
  '✓ Punto de venta',
  '✓ Inventario (sin ver costos ni ganancias)',
  '✓ Clientes y fiados',
  '✓ Pago a proveedores',
  '✗ Reportes y ganancias (no visible)',
  '✗ Configuración y facturación (no visible)',
];

export default function UsersPage() {
  const { user } = useAuthStore();
  const [showNew, setShowNew] = useState(false);
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => { const { data } = await api.get('/users'); return data; },
  });

  const createUser = useMutation({
    mutationFn: (payload: any) => api.post('/users', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Empleado creado'); setShowNew(false); reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Error al crear usuario'),
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}`, { isActive: false }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Usuario desactivado'); },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    createUser.mutate({ ...values, role: 'CASHIER' });
  };

  const sub = user?.tenant?.subscription;
  const planLabel = sub?.plan ?? 'TRIAL';
  const maxUsers = planLabel === 'ENTERPRISE' ? 999 : planLabel === 'TRIAL' ? 1 : 3;
  const activeUsers = users.filter((u: any) => u.isActive).length;
  const canAdd = activeUsers < maxUsers;

  if (user?.role !== 'OWNER' && user?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <Topbar title="Usuarios" />
        <div className="mt-8 text-center text-muted-foreground">No tenés permiso para ver esta sección.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Usuarios" subtitle="Gestión de empleados y accesos" />
      <div className="p-5 max-w-3xl space-y-4">

        {/* Plan info */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Usuarios del plan {planLabel}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {activeUsers} de {maxUsers === 999 ? 'ilimitados' : maxUsers} usuarios activos
                </p>
              </div>
              {planLabel === 'TRIAL' && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
                  En prueba = 1 usuario. <span className="font-bold">Activá el plan para agregar cajeros.</span>
                </div>
              )}
              {canAdd && planLabel !== 'TRIAL' && (
                <Button onClick={() => setShowNew(true)}>
                  <UserPlus className="h-4 w-4" /> Agregar cajero
                </Button>
              )}
            </div>
            {maxUsers !== 999 && (
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min((activeUsers / maxUsers) * 100, 100)}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users list */}
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h3 className="font-bold flex items-center gap-2">
              <Users className="h-4 w-4" /> Usuarios activos
            </h3>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">Cargando...</div>
            ) : users.filter((u: any) => u.isActive).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {u.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={u.role === 'OWNER' ? 'default' : 'secondary'}>
                    {ROLE_LABEL[u.role] ?? u.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{fdate(u.createdAt)}</span>
                  {u.role !== 'OWNER' && u.id !== user?.id && (
                    <button
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => { if (confirm(`¿Desactivar a ${u.name}?`)) deactivate.mutate(u.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cashier permissions info */}
        {planLabel === 'PRO' && (
          <Card>
            <CardContent className="pt-5">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Permisos del empleado (rol Cajero)
              </h3>
              <div className="grid grid-cols-2 gap-1.5 text-sm">
                {CASHIER_PERMISSIONS.map((p) => (
                  <p key={p} className={p.startsWith('✓') ? 'text-foreground' : 'text-muted-foreground'}>
                    {p}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New user modal */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar empleado</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-sm text-muted-foreground">
              El empleado tendrá acceso a <strong>Punto de venta, Inventario, Clientes y Proveedores</strong>.
              No verá costos, ganancias ni reportes financieros.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input placeholder="Nombre del empleado" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="email@ejemplo.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Contraseña inicial</Label>
                <Input type="password" placeholder="Mínimo 6 caracteres" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={createUser.isPending}>
                {createUser.isPending ? 'Creando...' : 'Crear empleado'}
              </Button>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
