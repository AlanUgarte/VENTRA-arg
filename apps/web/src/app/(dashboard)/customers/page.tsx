'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Search, Plus, Users, CreditCard, Wallet, Trash2 } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/shared/kpi-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { useCustomers, useCustomer, useCreateCustomer, useCreateCustomerPayment } from '@/hooks/use-customers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { money, fdate } from '@/lib/utils';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [viewId, setViewId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showPay, setShowPay] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Efectivo');
  const [payRef, setPayRef] = useState('');

  const { data: customers = [] } = useCustomers(search || undefined);
  const { data: customerDetail } = useCustomer(viewId ?? '');
  const createCustomer = useCreateCustomer();
  const createPayment = useCreateCustomerPayment();
  const qc = useQueryClient();
  const deleteCustomer = useMutation({
    mutationFn: (id: string) => api.patch(`/customers/${id}`, { isActive: false }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Cliente eliminado'); },
    onError: () => toast.error('No se pudo eliminar el cliente'),
  });

  const totalDebt = customers.reduce((s, c) => s + Math.max(0, c.balance), 0);
  const withDebt = customers.filter((c) => c.balance > 0.5).length;

  const handleNewCustomer = async () => {
    if (!newName.trim()) { toast.error('Ingresá el nombre'); return; }
    await createCustomer.mutateAsync({ name: newName.trim(), phone: newPhone.trim() || undefined });
    toast.success('Cliente creado');
    setShowNew(false);
    setNewName('');
    setNewPhone('');
  };

  const handlePayment = async () => {
    if (!showPay || !payAmount || Number(payAmount) <= 0) { toast.error('Ingresá un monto'); return; }
    await createPayment.mutateAsync({
      id: showPay,
      amount: Number(payAmount),
      method: payMethod,
      reference: payRef || undefined,
    });
    toast.success('Cobro registrado');
    setShowPay(null);
    setPayAmount('');
    setPayRef('');
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Clientes / Fiados" subtitle="Cuentas corrientes revaluadas al precio actual" />
      <div className="p-3 md:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiCard label="Total por cobrar" value={money(totalDebt)} icon={Wallet} color="text-violet-600" bg="bg-violet-100" sub="Cuentas corrientes" />
          <KpiCard label="Clientes con deuda" value={String(withDebt)} icon={CreditCard} color="text-accent" bg="bg-accent/10" sub={`${customers.length} clientes totales`} />
          <KpiCard label="Clientes activos" value={String(customers.length)} icon={Users} sub="Registrados" />
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
            <h3 className="font-bold">Cuentas de clientes</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar…"
                  className="pl-9 w-52"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button size="sm" onClick={() => setShowNew(true)}>
                <Plus className="h-4 w-4" /> Nuevo cliente
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {!customers.length ? (
              <EmptyState icon={Users} title="Sin clientes" description="Agregá tu primer cliente" />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Cliente', 'Teléfono', 'Fiados', 'Pagado', 'Deuda actual', ''].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.sort((a, b) => b.balance - a.balance).map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-semibold">{c.name}</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">{c.phone || '—'}</td>
                      <td className="px-4 py-2.5">{c.credits?.length ?? 0}</td>
                      <td className="px-4 py-2.5 font-mono">
                        {money(c.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`font-mono font-bold ${c.balance > 0.5 ? 'text-violet-600' : 'text-primary'}`}>
                          {money(Math.max(0, c.balance))}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-2 justify-end flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => setViewId(c.id)}>Ver cuenta</Button>
                          {c.balance > 0.5 && (
                            <Button size="sm" onClick={() => { setShowPay(c.id); setPayAmount(String(Math.round(c.balance))); }}>
                              Cobrar
                            </Button>
                          )}
                          <button
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Eliminar cliente"
                            onClick={() => {
                              if (confirm(`¿Eliminar a "${c.name}"? Sus fiados y pagos quedan en el historial.`))
                                deleteCustomer.mutate(c.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* New customer */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo cliente</DialogTitle></DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nombre y apellido</Label>
              <Input placeholder="Ej: María González" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono (opcional)</Label>
              <Input placeholder="341-..." value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleNewCustomer} disabled={createCustomer.isPending}>
              Crear cliente
            </Button>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Customer detail */}
      <Dialog open={!!viewId} onOpenChange={() => setViewId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{customerDetail?.name}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {customerDetail && (
              <>
                <div className="flex items-center justify-between rounded-xl bg-violet-50 px-4 py-3">
                  <span className="text-sm font-semibold text-violet-700">Deuda actual (precios de hoy)</span>
                  <span className="font-mono text-lg font-bold text-violet-700">{money(customerDetail.balance)}</span>
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">COMPRAS FIADAS</p>
                  {customerDetail.credits?.length ? (
                    <div className="space-y-2">
                      {customerDetail.credits.map((credit: any) => (
                        <div key={credit.id} className="rounded-xl border border-border p-3 text-sm">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>Fiado del {fdate(credit.createdAt)}</span>
                            <span className="font-mono font-bold text-foreground">{money(credit.currentValue)}</span>
                          </div>
                          {credit.lines?.map((l: any) => (
                            <div key={l.id} className="flex justify-between py-0.5">
                              <span>{l.quantity}× {l.productName}</span>
                              <span className="font-mono text-muted-foreground">{money(l.priceSnap * l.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin fiados pendientes.</p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">PAGOS RECIBIDOS</p>
                  {customerDetail.payments?.length ? (
                    <div className="space-y-1">
                      {customerDetail.payments.map((p: any) => (
                        <div key={p.id} className="flex justify-between text-sm py-1 border-b border-border/50">
                          <span>{fdate(p.paidAt)} · {p.method}</span>
                          <span className="font-mono text-primary font-semibold">{money(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin pagos registrados.</p>
                  )}
                </div>
                {customerDetail.balance > 0.5 && (
                  <Button className="w-full" onClick={() => { setViewId(null); setShowPay(customerDetail.id); setPayAmount(String(Math.round(customerDetail.balance))); }}>
                    Registrar cobro
                  </Button>
                )}
              </>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Payment modal */}
      <Dialog open={!!showPay} onOpenChange={() => setShowPay(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar cobro</DialogTitle></DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1.5">
              <Label>Monto $</Label>
              <Input type="number" min={0.01} step={0.01} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Medio de pago</Label>
              <select className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                {['Efectivo', 'Transferencia', 'Tarjeta de débito', 'Tarjeta de crédito', 'Mercado Pago'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>N° comprobante (opcional)</Label>
              <Input placeholder="Referencia" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handlePayment} disabled={createPayment.isPending}>
              Registrar cobro
            </Button>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
