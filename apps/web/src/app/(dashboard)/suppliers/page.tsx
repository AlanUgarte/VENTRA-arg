'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Truck, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
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
import { useSuppliers, useInvoices, useCreateSupplier, useCreateInvoice, useCreateSupplierPayment } from '@/hooks/use-suppliers';
import { money, fdate } from '@/lib/utils';

const CONDITIONS = [
  { value: 'CASH', label: 'Contado' },
  { value: 'DAYS_15', label: '15 días' },
  { value: 'DAYS_30', label: '30 días' },
  { value: 'DAYS_60', label: '60 días' },
  { value: 'DAYS_90', label: '90 días' },
  { value: 'CURRENT_ACCOUNT', label: 'Cuenta corriente' },
];

function statusVariant(status: string): any {
  return { PAID: 'success', PARTIAL: 'blue', PENDING: 'warning', OVERDUE: 'destructive' }[status] ?? 'outline';
}
function statusLabel(status: string) {
  return { PAID: 'Pagada', PARTIAL: 'Parcial', PENDING: 'Pendiente', OVERDUE: 'Vencida' }[status] ?? status;
}

export default function SuppliersPage() {
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [showInvoice, setShowInvoice] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [newName, setNewName] = useState('');

  // Invoice form
  const [invNumber, setInvNumber] = useState('');
  const [invCondition, setInvCondition] = useState('CASH');
  const [invIssuedAt, setInvIssuedAt] = useState(new Date().toISOString().slice(0, 10));
  const [invAmount, setInvAmount] = useState('');

  // Payment form
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Efectivo');
  const [payRef, setPayRef] = useState('');

  const { data: suppliers = [] } = useSuppliers();
  const { data: invoices = [] } = useInvoices(supplierFilter || undefined);
  const createSupplier = useCreateSupplier();
  const createInvoice = useCreateInvoice();
  const createPayment = useCreateSupplierPayment();

  const totalDebt = invoices.reduce((s, i) => s + i.saldo, 0);
  const overdue = invoices.filter((i) => i.isOverdue).reduce((s, i) => s + i.saldo, 0);
  const pending = invoices.filter((i) => i.saldo > 0).length;

  const handleNewSupplier = async () => {
    if (!newName.trim()) { toast.error('Ingresá el nombre'); return; }
    await createSupplier.mutateAsync({ name: newName.trim() });
    toast.success('Proveedor creado');
    setShowNewSupplier(false);
    setNewName('');
  };

  const handleCreateInvoice = async () => {
    if (!showInvoice || !invAmount) { toast.error('Completá todos los campos'); return; }
    await createInvoice.mutateAsync({
      supplierId: showInvoice,
      invoiceNumber: invNumber || 's/n',
      condition: invCondition,
      issuedAt: invIssuedAt,
      amount: Number(invAmount),
    });
    toast.success('Factura registrada');
    setShowInvoice(null);
    setInvNumber('');
    setInvAmount('');
  };

  const handlePayment = async () => {
    if (!showPayment || !payAmount) { toast.error('Ingresá un monto'); return; }
    await createPayment.mutateAsync({ invoiceId: showPayment, amount: Number(payAmount), method: payMethod, reference: payRef || undefined });
    toast.success('Pago registrado');
    setShowPayment(null);
    setPayAmount('');
    setPayRef('');
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Proveedores" subtitle="Facturas recibidas, condiciones y pagos" />
      <div className="p-3 md:p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard label="Total adeudado" value={money(totalDebt)} icon={DollarSign} color="text-accent" bg="bg-accent/10" sub={`${pending} facturas pendientes`} />
          <KpiCard label="Vencido" value={money(overdue)} icon={AlertCircle} color="text-destructive" bg="bg-destructive/10" sub="Requiere atención" />
          <KpiCard label="Proveedores" value={String(suppliers.length)} icon={Truck} sub="Registrados" />
          <KpiCard label="Facturas" value={String(invoices.length)} icon={CheckCircle} sub="Total registradas" />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Suppliers list */}
          <Card className="w-full md:w-72 flex-shrink-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-bold text-sm">Proveedores</h3>
              <Button size="sm" variant="outline" onClick={() => setShowNewSupplier(true)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="divide-y divide-border">
              <button
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors ${!supplierFilter ? 'bg-muted font-semibold' : ''}`}
                onClick={() => setSupplierFilter('')}
              >
                Todos los proveedores
              </button>
              {suppliers.map((s) => (
                <button
                  key={s.id}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors ${supplierFilter === s.id ? 'bg-muted font-semibold' : ''}`}
                  onClick={() => setSupplierFilter(s.id)}
                >
                  <span>{s.name}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); setShowInvoice(s.id); }}>
                      + Factura
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Invoices */}
          <Card className="flex-1 overflow-hidden">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="font-bold">Facturas y pagos</h3>
            </div>
            <div className="overflow-x-auto">
              {!invoices.length ? (
                <EmptyState icon={Truck} title="Sin facturas" description="Seleccioná un proveedor y registrá una factura" />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Proveedor', 'N°', 'Condición', 'Vto.', 'Monto', 'Pagado', 'Saldo', 'Estado', ''].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...invoices].sort((a, b) => (a.dueAt ?? '') < (b.dueAt ?? '') ? -1 : 1).map((inv) => (
                      <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-4 py-2.5 font-semibold">{inv.supplier?.name}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{inv.invoiceNumber}</td>
                        <td className="px-4 py-2.5"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{CONDITIONS.find(c => c.value === inv.condition)?.label}</span></td>
                        <td className={`px-4 py-2.5 font-mono text-xs ${inv.isOverdue ? 'font-bold text-destructive' : ''}`}>{fdate(inv.dueAt)}</td>
                        <td className="px-4 py-2.5 font-mono">{money(inv.amount)}</td>
                        <td className="px-4 py-2.5 font-mono">{money(inv.paid)}</td>
                        <td className="px-4 py-2.5 font-mono font-bold">{money(inv.saldo)}</td>
                        <td className="px-4 py-2.5"><Badge variant={statusVariant(inv.status)}>{statusLabel(inv.status)}</Badge></td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1.5 justify-end">
                            {inv.saldo > 0 && (
                              <Button size="sm" onClick={() => { setShowPayment(inv.id); setPayAmount(String(Math.round(inv.saldo))); }}>
                                Pagar
                              </Button>
                            )}
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
      </div>

      {/* New supplier */}
      <Dialog open={showNewSupplier} onOpenChange={setShowNewSupplier}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo proveedor</DialogTitle></DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input placeholder="Ej: Distribuidora Norte" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleNewSupplier} disabled={createSupplier.isPending}>Crear</Button>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* New invoice */}
      <Dialog open={!!showInvoice} onOpenChange={() => setShowInvoice(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar factura</DialogTitle></DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1.5">
              <Label>N° de factura</Label>
              <Input placeholder="A-0001-00012345" value={invNumber} onChange={(e) => setInvNumber(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fecha emisión</Label>
                <Input type="date" value={invIssuedAt} onChange={(e) => setInvIssuedAt(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Monto total $</Label>
                <Input type="number" min={0.01} placeholder="45000" value={invAmount} onChange={(e) => setInvAmount(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Condición de pago</Label>
              <Select value={invCondition} onValueChange={setInvCondition}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleCreateInvoice} disabled={createInvoice.isPending}>Registrar factura</Button>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Payment */}
      <Dialog open={!!showPayment} onOpenChange={() => setShowPayment(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar pago</DialogTitle></DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1.5">
              <Label>Monto $</Label>
              <Input type="number" min={0.01} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Medio de pago</Label>
              <select className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                {['Efectivo', 'Transferencia', 'Tarjeta de débito', 'Tarjeta de crédito', 'Cheque', 'Mercado Pago'].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Referencia (opcional)</Label>
              <Input placeholder="N° de comprobante" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handlePayment} disabled={createPayment.isPending}>Registrar pago</Button>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
