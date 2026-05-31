'use client';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Minus, Search, Percent, ShoppingCart, Trash2, Check, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Topbar } from '@/components/layout/topbar';
import { EmptyState } from '@/components/shared/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { useProducts, useRubros } from '@/hooks/use-products';
import { useCustomers } from '@/hooks/use-customers';
import { useCreateSale } from '@/hooks/use-sales';
import { useCartStore } from '@/store/cart.store';
import { money } from '@/lib/utils';
import { drawReceipt, shareOrDownloadReceipt } from '@/lib/receipt';
import type { Product, Sale } from '@/types';

const DISCOUNT_PRESETS = [0, 5, 10, 15];

export default function PosPage() {
  const [search, setSearch] = useState('');
  const [rubroFilter, setRubroFilter] = useState('Todos');
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [receiptCanvas, setReceiptCanvas] = useState<HTMLCanvasElement | null>(null);
  const [showFiarModal, setShowFiarModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const { data: products = [], isLoading } = useProducts();
  const { data: rubros = [] } = useRubros();
  const { data: customers = [] } = useCustomers();
  const createSale = useCreateSale();

  const { items, discountPct, addItem, removeItem, updateQty, setDiscount, clear, totals } =
    useCartStore();

  const { subtotal, discountAmount, total } = totals();

  const filtered = products.filter((p) => {
    const matchRubro = rubroFilter === 'Todos' || p.rubro?.name === rubroFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchRubro && matchSearch && p.isActive;
  });

  const rubroNames = ['Todos', ...rubros.map((r) => r.name)];

  const handleAddToCart = (product: Product, qty = 1) => {
    const err = addItem(
      {
        productId: product.id,
        name: product.name,
        rubroName: product.rubro?.name ?? '',
        precioVenta: product.precioVenta,
        costoReal: product.costoReal,
        stock: product.stock,
      },
      qty,
    );
    if (err) {
      toast.error(err);
    } else {
      toast.success(`+ ${qty}× ${product.name}`);
    }
  };

  const checkout = async (type: 'CASH' | 'CREDIT', customerId?: string) => {
    if (!items.length) return;
    try {
      const payload = {
        type,
        discountPct,
        customerId,
        lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };
      const sale: Sale = await createSale.mutateAsync(payload);
      const canvas = drawReceipt({
        orderNumber: sale.orderNumber,
        date: new Date(sale.createdAt),
        type: sale.type,
        customerName: sale.customer?.name,
        lines: sale.lines.map((l) => ({
          name: l.productName,
          quantity: l.quantity,
          unitPrice: Number(l.priceUnit),
          subtotal: Number(l.subtotal),
        })),
        subtotal: Number(sale.subtotal),
        discountPct: Number(sale.discountPct),
        discountAmount: Number(sale.discountAmount),
        total: Number(sale.total),
      });
      setReceiptSale(sale);
      setReceiptCanvas(canvas);
      clear();
      setShowFiarModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error al procesar la venta');
    }
  };

  const handleCash = () => checkout('CASH');
  const handleCredit = () => {
    if (!items.length) return;
    setShowFiarModal(true);
  };
  const confirmCredit = () => {
    if (!selectedCustomerId) { toast.error('Seleccioná un cliente'); return; }
    checkout('CREDIT', selectedCustomerId);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Punto de venta" subtitle="Armá el ticket y generá la venta" />

      <div className="flex flex-1 overflow-hidden p-5 gap-4">
        {/* Products panel */}
        <div className="flex flex-1 flex-col min-w-0 gap-3">
          {/* Controls */}
          <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artículo…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-3">
              <Percent className="h-4 w-4 text-accent" />
              <input
                type="number"
                min={0}
                max={100}
                value={discountPct}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-12 bg-transparent text-center font-mono font-semibold text-sm focus:outline-none"
              />
              <span className="text-sm font-bold text-accent">%</span>
              <div className="flex gap-1 ml-1">
                {DISCOUNT_PRESETS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDiscount(d)}
                    className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                      discountPct === d
                        ? 'bg-accent text-white'
                        : 'bg-white border border-accent/30 text-accent hover:bg-accent/10'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rubro chips */}
          <div className="flex flex-wrap gap-2">
            {rubroNames.map((r) => {
              const rubro = rubros.find((x) => x.name === r);
              return (
                <button
                  key={r}
                  onClick={() => setRubroFilter(r)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    rubroFilter === r
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border bg-card text-foreground hover:border-foreground/40'
                  }`}
                >
                  {rubro && (
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: rubro.color }}
                    />
                  )}
                  {r}
                </button>
              );
            })}
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : !filtered.length ? (
              <EmptyState title="Sin artículos" description="Ajustá el filtro o agregá productos" />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3 pb-4">
                {filtered.map((p) => {
                  const inCart = items.find((i) => i.productId === p.id);
                  const available = p.stock - (inCart?.quantity ?? 0);
                  const outOfStock = available <= 0;
                  const finalPrice =
                    discountPct > 0
                      ? Math.round(p.precioVenta * (1 - discountPct / 100))
                      : p.precioVenta;

                  return (
                    <div
                      key={p.id}
                      className={`relative flex flex-col rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        outOfStock ? 'opacity-60' : ''
                      }`}
                    >
                      <Badge
                        className="absolute right-3 top-3 font-mono"
                        variant={outOfStock ? 'destructive' : available <= 5 ? 'warning' : 'success'}
                      >
                        {outOfStock ? 'Sin stock' : `${available} u.`}
                      </Badge>
                      <span
                        className="mb-2 self-start rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          background: `${rubros.find((r) => r.name === p.rubro?.name)?.color ?? '#888'}22`,
                          color: rubros.find((r) => r.name === p.rubro?.name)?.color ?? '#888',
                        }}
                      >
                        {p.rubro?.name}
                      </span>
                      <p className="font-bold text-sm leading-tight">{p.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Gan. {money(p.gananciaUnit * (1 - discountPct / 100))} c/u
                      </p>
                      <div className="mt-auto pt-2">
                        {discountPct > 0 ? (
                          <p className="font-mono text-lg font-semibold">
                            <span className="mr-1 text-sm text-muted-foreground line-through">
                              {money(p.precioVenta)}
                            </span>
                            <span className="text-accent">{money(finalPrice)}</span>
                          </p>
                        ) : (
                          <p className="font-mono text-lg font-semibold">{money(p.precioVenta)}</p>
                        )}
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          disabled={outOfStock}
                          onClick={() => handleAddToCart(p)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {outOfStock ? 'Agotado' : 'Agregar'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="flex w-[320px] flex-shrink-0 flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="flex items-center gap-2 font-bold">
              <ShoppingCart className="h-4 w-4" />
              Ticket
              {items.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  · {items.reduce((s, i) => s + i.quantity, 0)} u.
                </span>
              )}
            </h3>
            {items.length > 0 && (
              <button
                onClick={clear}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Vaciar
              </button>
            )}
          </div>

          {!items.length ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center p-6">
              <ShoppingCart className="mb-3 h-10 w-10 text-border" />
              <p className="text-sm text-muted-foreground">
                Agregá artículos para armar el ticket
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-2 border-b border-border/50 px-3 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {money(item.precioVenta)} c/u
                    </p>
                  </div>
                  <div className="flex items-center overflow-hidden rounded-lg border border-border">
                    <button
                      className="flex h-6 w-6 items-center justify-center bg-muted/50 hover:bg-muted text-sm font-bold"
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="min-w-[1.5rem] text-center font-mono text-xs font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      className="flex h-6 w-6 items-center justify-center bg-muted/50 hover:bg-muted text-sm font-bold"
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="min-w-[60px] text-right font-mono text-sm font-semibold">
                    {money(item.precioVenta * item.quantity)}
                  </span>
                  <button
                    className="text-muted-foreground hover:text-accent"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Totals + buttons */}
          <div className="border-t border-border p-4 space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono">{money(subtotal)}</span>
            </div>
            {discountPct > 0 && (
              <div className="flex justify-between text-sm text-accent">
                <span>Descuento ({discountPct}%)</span>
                <span className="font-mono">−{money(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-dashed border-border pt-2 text-lg font-extrabold">
              <span>TOTAL</span>
              <span className="font-mono">{money(total)}</span>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <Button
                className="w-full"
                size="lg"
                disabled={!items.length || createSale.isPending}
                onClick={handleCash}
              >
                <Check className="h-4 w-4" />
                Cobrar y generar venta
              </Button>
              <Button
                variant="outline"
                className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
                disabled={!items.length || createSale.isPending}
                onClick={handleCredit}
              >
                Fiar a un cliente →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Fiar modal */}
      <Dialog open={showFiarModal} onOpenChange={setShowFiarModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fiar venta a cliente</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Total del ticket:{' '}
              <span className="font-mono font-bold text-foreground">{money(total)}</span>
            </p>
            <select
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">— Elegir cliente —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.balance > 0 ? ` · Debe ${money(c.balance)}` : ''}
                </option>
              ))}
            </select>
            <Button className="w-full" onClick={confirmCredit} disabled={createSale.isPending}>
              Registrar fiado
            </Button>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Receipt modal */}
      <Dialog open={!!receiptSale} onOpenChange={() => { setReceiptSale(null); setReceiptCanvas(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Venta generada ✓</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {receiptCanvas && (
              <img
                src={receiptCanvas.toDataURL('image/png')}
                alt="Comprobante"
                className="w-full rounded-xl border border-border"
              />
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                className="flex-1"
                onClick={() => receiptCanvas && shareOrDownloadReceipt(receiptCanvas, receiptSale!.orderNumber)}
              >
                <Download className="h-4 w-4" /> Descargar imagen
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => receiptCanvas && shareOrDownloadReceipt(receiptCanvas, receiptSale!.orderNumber)}
              >
                <Share2 className="h-4 w-4" /> Compartir
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => { setReceiptSale(null); setReceiptCanvas(null); }}
              >
                Listo
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
