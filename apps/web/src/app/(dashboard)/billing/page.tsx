'use client';
import { useState } from 'react';
import { Check, Zap, Crown, AlertTriangle, Copy, Loader2, ExternalLink } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { usePlans, useBillingSubscription, useSubscribe, useCancelSubscription } from '@/hooks/use-billing';
import { money, fdate } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api';

const PLAN_ICONS: Record<string, React.ElementType> = { BASIC: Zap, PRO: Crown };
const PLAN_COLORS: Record<string, string> = { BASIC: 'text-blue-600', PRO: 'text-primary' };
const PLAN_BG: Record<string, string>     = { BASIC: 'bg-blue-50',    PRO: 'bg-primary/5' };

const BANK = {
  titular: 'Alan Ugarte',
  banco:   'Banco Macro',
  cbu:     '2850792940095652605918',
  alias:   'VENTRAARG',
  email:   'ugartemultiproductos@gmail.com',
};

const STATUS_LABEL: Record<string, string> = {
  TRIAL: 'Período de prueba', ACTIVE: 'Activa',
  PAST_DUE: 'Pago pendiente', CANCELLED: 'Cancelada',
};
const STATUS_VARIANT: Record<string, any> = {
  TRIAL: 'warning', ACTIVE: 'success', PAST_DUE: 'destructive', CANCELLED: 'outline',
};

export default function BillingPage() {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'OWNER';

  const [transferPlan, setTransferPlan] = useState<any>(null);
  const [notifying, setNotifying]       = useState(false);
  const [notified, setNotified]         = useState(false);

  const { data: plans = [] }   = usePlans();
  const { data: subscription } = useBillingSubscription();
  const subscribe              = useSubscribe();
  const cancelSub              = useCancelSubscription();

  const sub = subscription ?? user?.tenant?.subscription;
  const trialDaysLeft = sub?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  const handleSubscribe = async (planId: string) => {
    try {
      const { initPoint } = await subscribe.mutateAsync(planId);
      window.open(initPoint, '_blank');
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Error al procesar. Intentá con transferencia bancaria.';
      toast.error(msg);
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Cancelar la suscripción? Perderás acceso al finalizar el período actual.')) return;
    try {
      await cancelSub.mutateAsync();
      toast.success('Suscripción cancelada');
    } catch {
      toast.error('Error al cancelar');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  const handleNotifyPayment = async () => {
    if (!transferPlan) return;
    setNotifying(true);
    try {
      await api.post('/billing/notify-payment', { plan: transferPlan.id });
      setNotified(true);
      toast.success('¡Notificación enviada! Activaremos tu plan en menos de 24 h.');
    } catch {
      toast.error('Error al enviar. Escribinos por email.');
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Suscripción" subtitle="Planes y facturación" />

      <div className="p-3 md:p-5 max-w-3xl space-y-5">

        {/* Estado actual */}
        {sub && (
          <Card>
            <CardContent className="pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Estado actual</p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">Plan {sub.plan}</h2>
                    <Badge variant={STATUS_VARIANT[sub.status]}>{STATUS_LABEL[sub.status]}</Badge>
                  </div>
                  {sub.status === 'TRIAL' && trialDaysLeft > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      ⏳ Te quedan <span className="font-bold text-foreground">{trialDaysLeft} día(s)</span> de prueba gratuita.
                    </p>
                  )}
                  {sub.status === 'TRIAL' && trialDaysLeft === 0 && (
                    <p className="mt-1 text-sm text-destructive font-semibold">Tu período de prueba venció. Elegí un plan para continuar.</p>
                  )}
                  {sub.status === 'ACTIVE' && sub.currentPeriodEnd && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Próximo cobro: <span className="font-semibold">{fdate(sub.currentPeriodEnd)}</span>
                    </p>
                  )}
                </div>
                {sub.status === 'ACTIVE' && isOwner && (
                  <Button variant="outline" size="sm" onClick={handleCancel} disabled={cancelSub.isPending}>
                    Cancelar suscripción
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner trial por vencer */}
        {sub?.status === 'TRIAL' && trialDaysLeft <= 2 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {trialDaysLeft === 0 ? 'Tu prueba venció' : `Tu prueba vence en ${trialDaysLeft} día${trialDaysLeft !== 1 ? 's' : ''}`}
              </p>
              <p className="text-sm mt-0.5">Elegí un plan para no perder el acceso.</p>
            </div>
          </div>
        )}

        {/* Planes */}
        <div>
          <h3 className="mb-4 font-bold text-lg">Elegí tu plan</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {plans.map((plan: any) => {
              const Icon = PLAN_ICONS[plan.id] ?? Zap;
              const isCurrent = subscription?.plan === plan.id && subscription?.status === 'ACTIVE';

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border-2 p-5 transition-shadow hover:shadow-md ${
                    plan.id === 'PRO' ? 'border-primary shadow-md shadow-primary/10' : 'border-border'
                  }`}
                >
                  {plan.id === 'PRO' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white shadow">Más popular</span>
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

                  <ul className="flex-1 space-y-2 mb-5">
                    {plan.features?.map((feat: string) => (
                      <li key={feat} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button className="w-full" disabled variant="outline">Plan actual ✓</Button>
                  ) : isOwner ? (
                    <div className="space-y-2">
                      {/* Botón principal: MP automático */}
                      <Button
                        className="w-full"
                        variant={plan.id === 'PRO' ? 'default' : 'outline'}
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={subscribe.isPending}
                      >
                        {subscribe.isPending
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
                          : <><ExternalLink className="mr-2 h-4 w-4" />Suscribirse con Mercado Pago</>
                        }
                      </Button>
                      {/* Fallback: transferencia bancaria */}
                      <button
                        onClick={() => { setTransferPlan(plan); setNotified(false); }}
                        className="w-full text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors py-1"
                      >
                        Pagar por transferencia bancaria
                      </button>
                    </div>
                  ) : (
                    <p className="text-center text-xs text-muted-foreground">Solo el dueño puede cambiar el plan</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info MP */}
        <Card>
          <CardContent className="pt-5 space-y-2">
            <h3 className="font-bold flex items-center gap-2"><span>💳</span> Cómo funciona el cobro automático</h3>
            <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
              <li>Hacés clic en <strong>"Suscribirse con Mercado Pago"</strong></li>
              <li>Se abre MP donde autorizás el cobro mensual automático</li>
              <li>Volvés a la app y tu plan se activa en segundos</li>
              <li>MP te cobra automáticamente cada mes hasta que canceles</li>
            </ol>
          </CardContent>
        </Card>

      </div>

      {/* Modal transferencia bancaria (fallback) */}
      <Dialog open={!!transferPlan} onOpenChange={() => setTransferPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Transferencia — {transferPlan?.name} ({money(transferPlan?.price)}/mes)
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {!notified ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Transferí <strong className="text-foreground">{money(transferPlan?.price)}</strong> a:
                </p>

                <div className="rounded-2xl bg-muted/50 border border-border p-4 space-y-3">
                  {[
                    { label: 'Titular', value: BANK.titular },
                    { label: 'Banco',   value: BANK.banco },
                    { label: 'CBU',     value: BANK.cbu },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
                        <p className="font-mono font-semibold text-sm">{value}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(value, label)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div
                  className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => copyToClipboard(`VENTRA ${transferPlan?.id} - ${user?.tenant?.name}`, 'Concepto')}
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-primary mb-1">Concepto (copiá esto)</p>
                    <p className="font-mono text-sm font-semibold">{`VENTRA ${transferPlan?.id} - ${user?.tenant?.name}`}</p>
                  </div>
                  <Copy className="h-4 w-4 text-primary flex-shrink-0" />
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                  ⏰ Activación manual en menos de <strong>24 horas hábiles</strong> después de confirmar.
                </div>

                <Button className="w-full" onClick={handleNotifyPayment} disabled={notifying}>
                  {notifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {notifying ? 'Enviando...' : '✅ Ya transferí, avisarme al activar'}
                </Button>

                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setTransferPlan(null)}>
                  Cerrar
                </Button>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="text-5xl">🎉</div>
                <h3 className="text-xl font-bold">¡Listo!</h3>
                <p className="text-sm text-muted-foreground">
                  Verificaremos tu transferencia y activaremos el <strong>{transferPlan?.name}</strong> en menos de <strong>24 horas hábiles</strong>.
                </p>
                <p className="text-xs text-muted-foreground">¿Dudas? <strong>{BANK.email}</strong></p>
                <Button className="w-full" onClick={() => setTransferPlan(null)}>Cerrar</Button>
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
