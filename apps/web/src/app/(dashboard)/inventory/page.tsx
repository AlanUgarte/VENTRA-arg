'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts, useRubros, useCreateProduct, useUpdateProduct, useAddStock, useDeleteProduct } from '@/hooks/use-products';
import { money } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2),
  rubroId: z.string().min(1, 'Seleccioná un rubro'),
  costoBase: z.coerce.number().min(0.01, 'Ingresá el costo'),
  descCompra: z.coerce.number().min(0).max(100).default(0),
  ganancia: z.coerce.number().min(0).default(40),
  stock: z.coerce.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof schema>;

export default function InventoryPage() {
  const [editId, setEditId] = useState<string | null>(null);
  const [stockId, setStockId] = useState<string | null>(null);
  const [stockQty, setStockQty] = useState(1);
  const { user } = useAuthStore();
  const isCashier = user?.role === 'CASHIER';

  const { data: products = [], isLoading } = useProducts(undefined, true);
  const { data: rubros = [] } = useRubros();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const addStock = useAddStock();
  const deleteProduct = useDeleteProduct();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const costoBase = watch('costoBase') ?? 0;
  const descCompra = watch('descCompra') ?? 0;
  const ganancia = watch('ganancia') ?? 0;
  const costoReal = costoBase * (1 - descCompra / 100);
  const precioVenta = Math.round(costoReal * (1 + ganancia / 100));
  const ganUnit = precioVenta - costoReal;

  const onSubmit = async (values: FormValues) => {
    try {
      if (editId) {
        await updateProduct.mutateAsync({ id: editId, ...values });
        toast.success('Artículo actualizado');
      } else {
        await createProduct.mutateAsync(values);
        toast.success('Artículo agregado');
      }
      reset({ name: '', rubroId: '', costoBase: 0, descCompra: 0, ganancia: 40, stock: 0 });
      setEditId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error');
    }
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    reset({
      name: p.name,
      rubroId: p.rubroId,
      costoBase: Number(p.costoBase),
      descCompra: Number(p.descCompra),
      ganancia: Number(p.ganancia),
      stock: p.stock,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Deshabilitar "${name}"?`)) return;
    await deleteProduct.mutateAsync(id);
    toast.success('Artículo deshabilitado');
  };

  const handleAddStock = async () => {
    if (!stockId || stockQty <= 0) return;
    await addStock.mutateAsync({ id: stockId, quantity: stockQty });
    toast.success(`+${stockQty} unidades agregadas`);
    setStockId(null);
    setStockQty(1);
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Inventario" subtitle="Artículos, precios y stock" />

      <div className="flex gap-5 p-5">
        {/* Form */}
        <Card className="w-[360px] flex-shrink-0">
          <CardContent className="pt-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold">
              <Plus className="h-4 w-4 text-primary" />
              {editId ? 'Editar artículo' : 'Nuevo artículo'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1">
                <Label>Nombre</Label>
                <Input placeholder="Ej: Leche entera 1L" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Rubro</Label>
                <Select
                  value={watch('rubroId')}
                  onValueChange={(v) => setValue('rubroId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná un rubro" />
                  </SelectTrigger>
                  <SelectContent>
                    {rubros.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rubroId && <p className="text-xs text-destructive">{errors.rubroId.message}</p>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label>Costo lista $</Label>
                  <Input type="number" min={0} step={0.01} placeholder="1000" {...register('costoBase')} />
                </div>
                <div className="space-y-1">
                  <Label>Desc. compra %</Label>
                  <Input type="number" min={0} max={100} step={0.1} placeholder="0" {...register('descCompra')} />
                </div>
                <div className="space-y-1">
                  <Label>% Ganancia</Label>
                  <Input type="number" min={0} step={0.1} placeholder="40" {...register('ganancia')} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Stock inicial</Label>
                <Input type="number" min={0} step={1} placeholder="24" {...register('stock')} />
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Costo real</span>
                  <span className="font-mono font-semibold">{money(costoReal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ganancia u.</span>
                  <span className="font-mono font-semibold text-primary">{money(ganUnit)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5 font-bold">
                  <span>Precio venta</span>
                  <span className="font-mono text-base">{money(precioVenta)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={createProduct.isPending || updateProduct.isPending}>
                  {editId ? 'Guardar cambios' : 'Agregar al inventario'}
                </Button>
                {editId && (
                  <Button type="button" variant="outline" onClick={() => { setEditId(null); reset(); }}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h3 className="font-bold">Inventario actual</h3>
            <span className="text-sm text-muted-foreground">
              {products.filter((p) => p.isActive).length} artículos ·{' '}
              {products.filter((p) => p.stock <= 5 && p.isActive).length} con stock bajo
            </span>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Cargando…</div>
            ) : !products.length ? (
              <EmptyState icon={Package} title="Sin artículos" description="Agregá tu primer artículo" />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {(isCashier ? ['Artículo', 'Rubro', 'P. venta', 'Stock', ''] : ['Artículo', 'Rubro', 'Costo real', 'P. venta', 'Gan. u.', 'Stock', '']).map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className={`border-b border-border/50 hover:bg-muted/30 ${!p.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-2.5 font-semibold">{p.name}</td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                          {p.rubro?.name}
                        </span>
                      </td>
                      {!isCashier && <td className="px-4 py-2.5 font-mono">{money(p.costoReal)}</td>}
                      <td className="px-4 py-2.5 font-mono font-semibold">{money(p.precioVenta)}</td>
                      {!isCashier && <td className="px-4 py-2.5 font-mono text-primary">{money(p.gananciaUnit)}</td>}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Badge variant={p.stock <= 0 ? 'destructive' : p.stock <= 5 ? 'warning' : 'success'}>
                            {p.stock}
                          </Badge>
                          <button
                            className="text-xs text-primary hover:underline"
                            onClick={() => setStockId(p.id)}
                          >
                            +stock
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1.5 justify-end">
                          <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-blue-600" onClick={() => handleEdit(p)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive" onClick={() => handleDelete(p.id, p.name)}>
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Add stock modal */}
      <Dialog open={!!stockId} onOpenChange={() => setStockId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sumar stock</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cantidad a agregar</Label>
              <Input
                type="number"
                min={1}
                value={stockQty}
                onChange={(e) => setStockQty(Number(e.target.value))}
              />
            </div>
            <Button className="w-full" onClick={handleAddStock} disabled={addStock.isPending}>
              Sumar {stockQty} unidades
            </Button>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
