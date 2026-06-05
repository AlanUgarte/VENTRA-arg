'use client';
import { useState } from 'react';
import { Loader2, KeyRound, User } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import api from '@/lib/api';

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Dueño', ADMIN: 'Administrador', CASHIER: 'Cajero',
};

export default function PerfilPage() {
  const { user } = useAuthStore();
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    if (next.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: current,
        newPassword: next,
      });
      toast.success('Contraseña cambiada correctamente. Volvé a iniciar sesión.');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Mi perfil" subtitle="Información de tu cuenta" />

      <div className="p-3 md:p-5 max-w-lg space-y-5">

        {/* Info de la cuenta */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl font-black text-primary">
                {user?.name?.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-lg">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3 py-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{ROLE_LABEL[user?.role ?? ''] ?? user?.role}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3 py-2">
                <span className="text-sm text-muted-foreground">Negocio:</span>
                <span className="text-sm font-semibold">{user?.tenant?.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cambiar contraseña */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-5">
              <KeyRound className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-base">Cambiar contraseña</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current">Contraseña actual</Label>
                <Input
                  id="current"
                  type="password"
                  value={current}
                  onChange={e => setCurrent(e.target.value)}
                  placeholder="Tu contraseña actual"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="next">Nueva contraseña</Label>
                <Input
                  id="next"
                  type="password"
                  value={next}
                  onChange={e => setNext(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repetí la nueva contraseña"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Cambiando...' : 'Cambiar contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
