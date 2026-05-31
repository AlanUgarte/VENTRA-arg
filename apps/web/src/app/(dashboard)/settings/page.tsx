'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fdate } from '@/lib/utils';
import { CreditCard, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const sub = user?.tenant?.subscription;

  const planVariant: Record<string, any> = {
    TRIAL: 'warning',
    ACTIVE: 'success',
    PAST_DUE: 'destructive',
    CANCELLED: 'outline',
  };

  const trialDaysLeft = sub?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  const isTrialExpired  = sub?.status === 'TRIAL' && trialDaysLeft === 0;
  const isTrialExpiring = sub?.status === 'TRIAL' && trialDaysLeft <= 2 && !isTrialExpired;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Configuración" subtitle="Negocio, usuarios y suscripción" />
      <div className="p-5 max-w-2xl space-y-4">

        {/* Trial banners */}
        {isTrialExpired && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Tu período de prueba venció</p>
              <p className="text-sm">Activá un plan para seguir usando el sistema.</p>
            </div>
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              <Link href="/billing">Ver planes</Link>
            </Button>
          </div>
        )}

        {isTrialExpiring && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">
                Tu prueba vence en {trialDaysLeft} día{trialDaysLeft !== 1 ? 's' : ''}
              </p>
              <p className="text-sm">Elegí un plan para no perder el acceso.</p>
            </div>
            <Button asChild size="sm"><Link href="/billing">Ver planes</Link></Button>
          </div>
        )}

        <Card>
          <CardContent className="pt-5 space-y-3">
            <h3 className="font-bold">Información del negocio</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Nombre</p>
                <p className="font-semibold">{user?.tenant?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Slug</p>
                <p className="font-mono text-xs text-muted-foreground">{user?.tenant?.slug}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Suscripción</h3>
              <Button asChild variant="outline" size="sm">
                <Link href="/billing">
                  <CreditCard className="h-3.5 w-3.5" /> Gestionar
                </Link>
              </Button>
            </div>
            {sub && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Plan</p>
                  <p className="font-semibold">{sub.plan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Estado</p>
                  <Badge variant={planVariant[sub.status]}>{sub.status}</Badge>
                </div>
                {sub.status === 'TRIAL' && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Prueba hasta</p>
                    <p className="font-semibold">{fdate(sub.trialEndsAt)}</p>
                  </div>
                )}
                {sub.status === 'ACTIVE' && sub.currentPeriodEnd && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Próximo cobro</p>
                    <p className="font-semibold">{fdate(sub.currentPeriodEnd)}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 space-y-2">
            <h3 className="font-bold">Mi cuenta</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Nombre</p>
                <p className="font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Email</p>
                <p className="font-mono text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Rol</p>
                <Badge>{user?.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
