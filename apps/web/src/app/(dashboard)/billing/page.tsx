'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Check,
  Zap,
  Crown,
  Building2,
  AlertTriangle,
  ExternalLink,
  X,
} from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth.store';
import { usePlans, useBillingSubscription, useSubscribe, useCancelSubscription } from '@/hooks/use-billing';
import { money, fdate } from '@/lib/utils';

const PLAN_ICONS: Record<string, React.ElementType> = {
  BASIC: Zap,
  PRO: Crown,
};

const PLAN_COLORS: Record<string, string> = {
  BASIC: 'text-blue-600',
  PRO: 'text-primary',
  ENTERPRISE: 'text-violet-600',
};

const PLAN_BG: Record<string, string> = {
  BASIC: 'bg-blue-50',
  PRO: 'bg-primary/5',
  ENTERPRISE: 'bg-violet-50',
};

const STATUS_LABEL: Record<string, string> = {
  TRIAL: 'Período de prueba',
  ACTIVE: 'Activa',
  PAST_DUE: 'Pago pendiente',
  CANCELLED: 'Cancelada',
};

const STATUS_VARIANT: Record<string, any> = {
  TRIAL: 'warning',
  ACTIVE: 'success',
  PAST_DUE: 'destructive',
  CANCELLED: 'outline',
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'OWNER';

  const { data: plans = [] } = usePlans();
  const { data: subscription, refetch } = useBillingSubscription();
  const subscribe = useSubscribe();
  const cancelSub = useCancelSubscription();

  const [confirmCancel, setConfirmCancel] = useState(false);

  // Handle redirect back from MP
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      toast.success('¡Pago procesado! Tu suscripción se activará en segundos.');
      // Poll for a few seconds to catch the webhook
      const timer = setInterval(() => refetch(), 3000);
      setTimeout(() => clearInterval(timer), 15000);
    }
  }, [searchParams, refetch]);

  const handleSubscribe = async (planId: string) => {
    if (!isOwner) {
      toast.error('Solo el dueño puede gestionar la suscripción');
      return;
    }
    try {
      const { initPoint } = await subscribe.mutateAsync(planId);
      window.open(initPoint, '_blank');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error al iniciar el proceso de pago');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSub.mutateAsync();
      toast.success('Suscripción cancelada');
      setConfirmCancel(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error al cancelar');
    }
  };

  const trialDaysLeft = subscription?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Suscripción" subtitle="Planes y facturación" />

      <div className="p-5 max-w-4xl space-y-6">
        {/* Current subscription status */}
        {subscription && (
          <Card>
            <CardContent className="pt-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Estado actual
                  </p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">
                      Plan {subscription.plan}
                    </h2>
                    <Badge variant={STATUS_VARIANT[subscription.status]}>
                      {STATUS_LABEL[subscription.status]}
                    </Badge>
                  </div>

                  {subscription.status === 'TRIAL' && trialDaysLeft > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      ⏳ Te quedan{' '}
                      <span className="font-bold text-foreground">{trialDaysLeft} día(s)</span>{' '}
                      de prueba gratuita.
                    </p>
                  )}
                  {subscription.status === 'TRIAL' && trialDaysLeft === 0 && (
                    <p className="mt-1 text-sm text-destructive font-semibold">
                      Tu período de prueba venció. Activá un plan para seguir usando el sistema.
                    </p>
                  )}
                  {subscription.status === 'ACTIVE' && subscription.currentPeriodEnd && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Próximo cobro: <span className="font-semibold">{fdate(subscription.currentPeriodEnd)}</span>
                    </p>
                  )}
                  {subscription.status === 'PAST_DUE' && (
                    <p className="mt-1 text-sm text-destructive">
                      Tenés un pago pendiente. Regularizá tu suscripción para continuar.
                    </p>
                  )}
                </div>

                {subscription.status === 'ACTIVE' && isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={() => setConfirmCancel(true)}
                  >
                    <X className="h-3.5 w-3.5" /> Cancelar suscripción
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trial expiry warning banner */}
        {subscription?.status === 'TRIAL' && trialDaysLeft <= 1 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Tu prueba {trialDaysLeft === 0 ? 'venció' : 'vence mañana'}</p>
              <p className="text-sm mt-0.5">
                Elegí un plan abajo para no perder acceso al sistema ni a tus datos.
              </p>
            </div>
          </div>
        )}

        {/* Plans */}
        <div>
          <h3 className="mb-4 font-bold text-lg">Elegí tu plan</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = PLAN_ICONS[plan.id] ?? Zap;
              const isCurrentPlan =
                subscription?.plan === plan.id && subscription?.status === 'ACTIVE';
              const isMostPopular = plan.id === 'PRO';

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border-2 p-5 transition-shadow hover:shadow-md ${
                    isMostPopular
                      ? 'border-primary shadow-md shadow-primary/10'
                      : 'border-border'
                  }`}
                >
                  {isMostPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white shadow">
                        Más popular
                      </span>
                    </div>
                  )}

                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${PLAN_BG[plan.id]}`}>
                    <Icon className={`h-5 w-5 ${PLAN_COLORS[plan.id]}`} />
                  </div>

                  <h4 className="font-bold text-lg">{plan.name}</h4>
                  <p className="mt-0.5 text-sm text-muted-foreground">{plan.description}</p>

                  <div className="my-4">
                    <span className="font-mono text-3xl font-bold">{money(plan.price)}</span>
                    <span className="text-sm text-muted-foreground"> / mes</span>
                  </div>

                  <Separator className="mb-4" />

                  <ul className="flex-1 space-y-2 mb-5">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button className="w-full" disabled variant="outline">
                      Plan actual ✓
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isMostPopular ? 'default' : 'outline'}
                      disabled={subscribe.isPending || !isOwner}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {subscribe.isPending ? 'Procesando…' : (
                        <>
                          <ExternalLink className="h-3.5 w-3.5" />
                          Suscribirse con MP
                        </>
                      )}
                    </Button>
                  )}

                  {!isOwner && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Solo el dueño puede cambiar el plan
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info box */}
        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground">¿Cómo funciona?</p>
          <p>1. Hacé clic en "Suscribirse con MP" → se abre Mercado Pago en una nueva pestaña.</p>
          <p>2. Completás el pago y autorizás el cobro mensual automático.</p>
          <p>3. Volvés a esta pantalla y tu plan se activa en segundos (por webhook).</p>
          <p>4. Mercado Pago te cobra automáticamente cada mes hasta que canceles.</p>
          <p className="pt-1">Podés cancelar en cualquier momento desde esta página. Tus datos no se borran.</p>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar suscripción?</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Si cancelás, no se te cobrarán más cuotas mensuales. Seguirás teniendo acceso hasta
              el final del período actual. Tus datos se conservan.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmCancel(false)}
              >
                Volver
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={cancelSub.isPending}
              >
                {cancelSub.isPending ? 'Cancelando…' : 'Sí, cancelar'}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
