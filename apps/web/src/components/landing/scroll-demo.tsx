'use client';
import { useState, useRef, useEffect } from 'react';
import {
  ShoppingCart, Package, Users, Truck, BarChart3,
  Search, Plus, Minus, Check, ScanLine, Percent,
  Trash2, Wallet, CreditCard, DollarSign, TrendingUp,
  AlertCircle, RotateCcw, Settings,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const money = (n: number) => '$' + n.toLocaleString('es-AR');

const SIDEBAR_ITEMS = [
  { icon: ShoppingCart, label: 'POS'         },
  { icon: Package,      label: 'Inventario'  },
  { icon: Users,        label: 'Clientes'    },
  { icon: Truck,        label: 'Proveedores' },
  { icon: BarChart3,    label: 'Reportes'    },
  { icon: RotateCcw,    label: 'Devoluc.'   },
  { icon: Settings,     label: 'Config.'    },
];

function Bdg({
  text, variant,
}: {
  text: string;
  variant: 'green' | 'red' | 'yellow' | 'blue' | 'violet' | 'gray' | 'orange';
}) {
  const styles: Record<string, { bg: string; fg: string }> = {
    green:  { bg: '#dcfce7', fg: '#15803d'  },
    red:    { bg: '#fee2e2', fg: '#b91c1c'  },
    yellow: { bg: '#fef9c3', fg: '#854d0e'  },
    blue:   { bg: '#dbeafe', fg: '#1d4ed8'  },
    violet: { bg: '#ede9fe', fg: '#6d28d9'  },
    gray:   { bg: '#f3f4f6', fg: '#6b7280'  },
    orange: { bg: '#ffedd5', fg: '#c2410c'  },
  };
  const { bg, fg } = styles[variant];
  return (
    <span style={{ background: bg, color: fg, padding: '1px 6px', borderRadius: 6, fontSize: 8, fontWeight: 800, whiteSpace: 'nowrap' }}>
      {text}
    </span>
  );
}

function MTopbar({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ padding: '8px 12px 7px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{title}</div>
      <div style={{ fontSize: 8.5, color: '#9ca3af', marginTop: 2, lineHeight: 1 }}>{sub}</div>
    </div>
  );
}

function MKpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '7px 9px' }}>
      <div style={{ fontSize: 7, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2, lineHeight: 1 }}>{label}</div>
      <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13, color, lineHeight: 1.2, marginBottom: 1 }}>{value}</div>
      <div style={{ fontSize: 7.5, color: '#9ca3af', lineHeight: 1 }}>{sub}</div>
    </div>
  );
}

// ─── Screen: POS ─────────────────────────────────────────────────────────────

function ScreenPOS() {
  const products = [
    { name: 'Gaseosa 1.5L',  rubro: 'Bebidas',   rubroC: '#2f6fed', price: 1250, gan: 450,  stock: 18, badge: '18 u.' as string, bv: 'green'  as const },
    { name: 'Leche entera',   rubro: 'Alimentos', rubroC: '#0d9f6e', price: 1100, gan: 300,  stock: 6,  badge: '6 u.',             bv: 'yellow' as const },
    { name: 'Alfajor triple', rubro: 'Dulces',    rubroC: '#f0653e', price: 650,  gan: 230,  stock: 24, badge: '24 u.',            bv: 'green'  as const },
    { name: 'Chips 100g',     rubro: 'Snacks',    rubroC: '#7c5cff', price: 550,  gan: 175,  stock: 0,  badge: 'Sin stock',        bv: 'red'    as const },
    { name: 'Agua 500ml',     rubro: 'Bebidas',   rubroC: '#2f6fed', price: 450,  gan: 175,  stock: 30, badge: '30 u.',            bv: 'green'  as const },
    { name: 'Galletitas x6',  rubro: 'Dulces',    rubroC: '#f0653e', price: 480,  gan: 160,  stock: 12, badge: '12 u.',            bv: 'green'  as const },
  ];
  const cart = [
    { name: 'Gaseosa 1.5L',  qty: 2, price: 1250 },
    { name: 'Alfajor triple', qty: 1, price: 650  },
    { name: 'Chips 100g',     qty: 3, price: 550  },
  ];
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const disc = 0.10;
  const discAmt = Math.round(subtotal * disc);
  const total = subtotal - discAmt;

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <MTopbar title="Punto de venta" sub="Armá el ticket y generá la venta" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Products */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f9fafb' }}>
          {/* Search + discount */}
          <div style={{ padding: '7px 8px', borderBottom: '1px solid #e5e7eb', background: '#fff', display: 'flex', gap: 5 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #e5e7eb', borderRadius: 8, padding: '4px 8px', background: '#f9fafb' }}>
              <Search size={11} style={{ stroke: '#9ca3af', flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: '#9ca3af' }}>Buscar artículo o código…</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #fca5a5', borderRadius: 8, padding: '4px 7px', background: '#fff7ed' }}>
              <Percent size={10} style={{ stroke: '#f0653e' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 800, color: '#f0653e' }}>10</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#f0653e' }}>%</span>
              <div style={{ display: 'flex', gap: 3, marginLeft: 2 }}>
                {[0,5,10,15].map(d => (
                  <span key={d} style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 5, background: d === 10 ? '#f0653e' : '#f3f4f6', color: d === 10 ? '#fff' : '#6b7280' }}>{d}</span>
                ))}
              </div>
            </div>
          </div>
          {/* Rubro chips */}
          <div style={{ display: 'flex', gap: 5, padding: '5px 8px', borderBottom: '1px solid #e5e7eb', background: '#fff', overflowX: 'auto' }}>
            {['Todos','Bebidas','Alimentos','Dulces','Snacks'].map((r, i) => (
              <span key={r} style={{ fontSize: 8.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20, flexShrink: 0, background: i === 0 ? '#111827' : '#f3f4f6', color: i === 0 ? '#fff' : '#374151', border: i === 0 ? 'none' : '1px solid #e5e7eb' }}>{r}</span>
            ))}
          </div>
          {/* Product grid */}
          <div style={{ flex: 1, overflow: 'hidden', padding: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, alignContent: 'start' }}>
            {products.map(p => (
              <div key={p.name} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '7px 7px 6px', display: 'flex', flexDirection: 'column', position: 'relative', opacity: p.stock === 0 ? 0.5 : 1 }}>
                <div style={{ position: 'absolute', top: 5, right: 5 }}>
                  <Bdg text={p.badge} variant={p.bv} />
                </div>
                <span style={{ fontSize: 7.5, fontWeight: 700, padding: '1px 5px', borderRadius: 8, alignSelf: 'flex-start', marginBottom: 3, color: p.rubroC, background: p.rubroC + '18' }}>{p.rubro}</span>
                <span style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.2, marginBottom: 1, paddingRight: 14 }}>{p.name}</span>
                <span style={{ fontSize: 8, color: '#9ca3af', marginBottom: 3 }}>Gan. {money(Math.round(p.gan * 0.9))} c/u</span>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 800, marginBottom: 4 }}>
                    <span style={{ fontSize: 8.5, color: '#9ca3af', textDecoration: 'line-through', marginRight: 3 }}>{money(p.price)}</span>
                    <span style={{ color: '#f0653e' }}>{money(Math.round(p.price * 0.9))}</span>
                  </div>
                  <div style={{ width: '100%', background: p.stock === 0 ? '#f3f4f6' : '#0d9f6e', color: '#fff', borderRadius: 6, padding: '4px 0', fontSize: 8.5, fontWeight: 700, textAlign: 'center' }}>
                    {p.stock === 0 ? 'Agotado' : '+ Agregar'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div style={{ width: 148, display: 'flex', flexDirection: 'column', background: '#fff', borderLeft: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 9px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800 }}>
              <ShoppingCart size={11} style={{ stroke: '#374151' }} /> Ticket
              <span style={{ fontSize: 8, color: '#9ca3af', fontWeight: 400 }}>· 6 u.</span>
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, color: '#f0653e' }}>Vaciar</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ fontSize: 8, color: '#9ca3af', fontFamily: 'monospace' }}>{money(item.price)} c/u</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ padding: '2px 4px', background: '#f9fafb', fontSize: 10, fontWeight: 800, color: '#374151' }}>−</div>
                  <span style={{ fontSize: 9, fontWeight: 800, minWidth: 14, textAlign: 'center', fontFamily: 'monospace' }}>{item.qty}</span>
                  <div style={{ padding: '2px 4px', background: '#f9fafb', fontSize: 10, fontWeight: 800, color: '#374151' }}>+</div>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, minWidth: 36, textAlign: 'right' }}>{money(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '7px 9px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: '#6b7280', marginBottom: 2 }}>
              <span>Subtotal</span><span style={{ fontFamily: 'monospace' }}>{money(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: '#f0653e', marginBottom: 4 }}>
              <span>Descuento (10%)</span><span style={{ fontFamily: 'monospace' }}>−{money(discAmt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 900, borderTop: '1px dashed #e5e7eb', paddingTop: 5, marginBottom: 6 }}>
              <span>TOTAL</span><span style={{ fontFamily: 'monospace' }}>{money(total)}</span>
            </div>
            <div style={{ width: '100%', background: '#0d9f6e', color: '#fff', borderRadius: 8, padding: '7px 0', fontSize: 9.5, fontWeight: 800, textAlign: 'center', marginBottom: 4, boxShadow: '0 2px 8px rgba(13,159,110,.35)' }}>
              <Check size={10} style={{ stroke: '#fff', display: 'inline', marginRight: 4 }} />
              Cobrar y generar venta
            </div>
            <div style={{ width: '100%', border: '1px solid #ddd6fe', color: '#7c3aed', borderRadius: 8, padding: '5px 0', fontSize: 9, fontWeight: 700, textAlign: 'center' }}>
              Fiar a un cliente →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Inventario ───────────────────────────────────────────────────────

function ScreenInventory() {
  const rows = [
    { name: 'Gaseosa 1.5L',  rubro: 'Bebidas',   rc: '#2f6fed', costo: 800,  precio: 1250, gan: 450, stock: 18, ok: 'green'  as const },
    { name: 'Leche entera',   rubro: 'Alimentos', rc: '#0d9f6e', costo: 750,  precio: 1100, gan: 350, stock: 6,  ok: 'yellow' as const },
    { name: 'Alfajor triple', rubro: 'Dulces',    rc: '#f0653e', costo: 420,  precio: 650,  gan: 230, stock: 24, ok: 'green'  as const },
    { name: 'Chips 100g',     rubro: 'Snacks',    rc: '#7c5cff', costo: 375,  precio: 550,  gan: 175, stock: 3,  ok: 'yellow' as const },
    { name: 'Agua 500ml',     rubro: 'Bebidas',   rc: '#2f6fed', costo: 275,  precio: 450,  gan: 175, stock: 30, ok: 'green'  as const },
    { name: 'Galletitas x6',  rubro: 'Dulces',    rc: '#f0653e', costo: 320,  precio: 480,  gan: 160, stock: 0,  ok: 'red'    as const },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <MTopbar title="Inventario" sub="Artículos, precios y stock" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left form */}
        <div style={{ width: 168, background: '#fff', borderRight: '1px solid #e5e7eb', padding: '8px 9px', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5, color: '#111827' }}>
            <Plus size={12} style={{ stroke: '#0d9f6e' }} /> Nuevo artículo
          </div>
          {[
            { label: 'Nombre', placeholder: 'Ej: Leche entera 1L', wide: true },
            { label: 'Rubro', placeholder: 'Seleccioná un rubro', wide: true },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: '#374151', marginBottom: 2 }}>{f.label}</div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 7, padding: '4px 8px', fontSize: 9, color: '#9ca3af', background: '#f9fafb' }}>{f.placeholder}</div>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 6 }}>
            {['Costo $', 'Desc %', 'Gan %'].map((l, i) => (
              <div key={l}>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: '#374151', marginBottom: 2 }}>{l}</div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '3px 5px', fontSize: 9, fontFamily: 'monospace', fontWeight: 700, color: '#111827', background: '#f9fafb' }}>
                  {['800', '5', '45'][i]}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: '#374151', marginBottom: 2 }}>Código de barras</div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 7, padding: '4px 8px', fontSize: 9, color: '#9ca3af', background: '#f9fafb' }}>7790001234567</div>
          </div>
          {/* Live preview */}
          <div style={{ border: '1px dashed #e5e7eb', borderRadius: 8, padding: '7px 8px', background: '#f9fafb', marginBottom: 6 }}>
            {[
              { label: 'Costo real', value: '$760', color: '#374151' },
              { label: 'Ganancia u.',value: '$382', color: '#0d9f6e' },
              { label: 'Precio venta',value: '$1.142', color: '#111827', bold: true },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, borderBottom: r.bold ? '1px solid #e5e7eb' : 'none', paddingBottom: r.bold ? 3 : 0, marginTop: r.bold ? 3 : 0 }}>
                <span style={{ fontSize: 8.5, color: '#6b7280' }}>{r.label}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: r.bold ? 800 : 700, color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={{ width: '100%', background: '#0d9f6e', color: '#fff', borderRadius: 8, padding: '6px 0', fontSize: 9, fontWeight: 800, textAlign: 'center' }}>
            Agregar al inventario
          </div>
        </div>

        {/* Right table */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid #e5e7eb', background: '#fff', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 800 }}>Inventario actual</span>
            <span style={{ fontSize: 8, color: '#9ca3af' }}>6 artículos · 2 con stock bajo</span>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Artículo','Rubro','Costo','Precio','Gan. u.','Stock',''].map(h => (
                    <th key={h} style={{ padding: '4px 7px', textAlign: 'left', fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '.04em', background: '#fff' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.name} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '5px 7px', fontWeight: 700, fontSize: 9.5, color: '#111827' }}>{r.name}</td>
                    <td style={{ padding: '5px 7px' }}>
                      <span style={{ fontSize: 7.5, fontWeight: 700, padding: '1px 5px', borderRadius: 8, color: r.rc, background: r.rc + '1a' }}>{r.rubro}</span>
                    </td>
                    <td style={{ padding: '5px 7px', fontFamily: 'monospace', fontSize: 9, color: '#6b7280' }}>{money(r.costo)}</td>
                    <td style={{ padding: '5px 7px', fontFamily: 'monospace', fontSize: 9, fontWeight: 700 }}>{money(r.precio)}</td>
                    <td style={{ padding: '5px 7px', fontFamily: 'monospace', fontSize: 9, color: '#0d9f6e', fontWeight: 700 }}>{money(r.gan)}</td>
                    <td style={{ padding: '5px 7px' }}><Bdg text={r.stock === 0 ? 'Sin stock' : String(r.stock)} variant={r.ok} /></td>
                    <td style={{ padding: '5px 7px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 5, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 9, color: '#2563eb' }}>✏</span>
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: 5, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={9} style={{ stroke: '#dc2626' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Clientes / Fiados ────────────────────────────────────────────────

function ScreenCustomers() {
  const customers = [
    { name: 'María González',   phone: '11 5555-1234', fiados: 5, pagado: 3200, balance: 4750 },
    { name: 'Roberto Sánchez',  phone: '11 4444-5678', fiados: 3, pagado: 1500, balance: 1200 },
    { name: 'Carlos Ruiz',      phone: '—',            fiados: 2, pagado: 2100, balance: 0    },
    { name: 'Ana López',        phone: '11 6666-9012', fiados: 4, pagado: 900,  balance: 3100 },
    { name: 'Jorge Martínez',   phone: '11 7777-3456', fiados: 1, pagado: 550,  balance: 0    },
  ];
  const totalDebt = customers.reduce((s, c) => s + c.balance, 0);
  const withDebt = customers.filter(c => c.balance > 0).length;

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <MTopbar title="Clientes / Fiados" sub="Cuentas corrientes revaluadas al precio actual" />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* KPIs */}
        <div style={{ display: 'flex', gap: 5, padding: '7px 9px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <MKpi label="Total por cobrar"    value={money(totalDebt)} sub="Cuentas corrientes" color="#7c3aed" />
          <MKpi label="Clientes con deuda"  value={String(withDebt)} sub={`${customers.length} clientes totales`} color="#f0653e" />
          <MKpi label="Clientes activos"    value={String(customers.length)} sub="Registrados" color="#111827" />
        </div>

        {/* Table header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
          <span style={{ fontSize: 10, fontWeight: 800 }}>Cuentas de clientes</span>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #e5e7eb', borderRadius: 7, padding: '3px 8px', background: '#f9fafb' }}>
              <Search size={10} style={{ stroke: '#9ca3af' }} />
              <span style={{ fontSize: 8.5, color: '#9ca3af' }}>Buscar…</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#0d9f6e', color: '#fff', borderRadius: 7, padding: '3px 8px', fontSize: 8.5, fontWeight: 700 }}>
              <Plus size={9} style={{ stroke: '#fff' }} /> Nuevo
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                {['Cliente','Teléfono','Fiados','Pagado','Deuda actual',''].map(h => (
                  <th key={h} style={{ padding: '4px 8px', textAlign: 'left', fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', background: '#fff', letterSpacing: '.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.sort((a,b) => b.balance - a.balance).map(c => (
                <tr key={c.name} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '5px 8px', fontWeight: 700, fontSize: 9.5 }}>{c.name}</td>
                  <td style={{ padding: '5px 8px', fontFamily: 'monospace', color: '#9ca3af', fontSize: 8.5 }}>{c.phone}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: 9 }}>{c.fiados}</td>
                  <td style={{ padding: '5px 8px', fontFamily: 'monospace', fontSize: 9 }}>{money(c.pagado)}</td>
                  <td style={{ padding: '5px 8px', fontFamily: 'monospace', fontSize: 10, fontWeight: 800, color: c.balance > 0 ? '#7c3aed' : '#0d9f6e' }}>
                    {money(c.balance)}
                  </td>
                  <td style={{ padding: '5px 8px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: 6, cursor: 'pointer' }}>Ver</span>
                      {c.balance > 0 && <span style={{ fontSize: 8, fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '2px 6px', borderRadius: 6 }}>Cobrar</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Proveedores ─────────────────────────────────────────────────────

function ScreenSuppliers() {
  const invoices = [
    { supplier: 'Distribuidora Norte', num: 'FAC-0001', condition: '30 días', amount: 12400, saldo: 12400, status: 'PENDING',  isOverdue: false },
    { supplier: 'Bebidas del Sur',     num: 'FAC-0024', condition: 'Contado', amount: 8200,  saldo: 8200,  status: 'OVERDUE',  isOverdue: true  },
    { supplier: 'Distribuidora Norte', num: 'FAC-0003', condition: '15 días', amount: 5600,  saldo: 2800,  status: 'PARTIAL',  isOverdue: false },
    { supplier: 'Golosinas SA',        num: 'FAC-0011', condition: '30 días', amount: 9300,  saldo: 9300,  status: 'PENDING',  isOverdue: false },
    { supplier: 'Bebidas del Sur',     num: 'FAC-0019', condition: 'Contado', amount: 3100,  saldo: 0,     status: 'PAID',     isOverdue: false },
  ];
  const totalDebt = invoices.reduce((s, i) => s + i.saldo, 0);
  const overdue = invoices.filter(i => i.isOverdue).reduce((s, i) => s + i.saldo, 0);
  const pending = invoices.filter(i => i.saldo > 0).length;

  const statusVariant = (s: string): 'green' | 'red' | 'yellow' | 'blue' => (
    { PAID: 'green', PARTIAL: 'blue', PENDING: 'yellow', OVERDUE: 'red' } as any
  )[s] ?? 'gray';
  const statusLabel = (s: string) => (
    { PAID: 'Pagada', PARTIAL: 'Parcial', PENDING: 'Pendiente', OVERDUE: 'Vencida' } as any
  )[s] ?? s;

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <MTopbar title="Proveedores" sub="Facturas, pagos y cuenta corriente" />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* KPIs */}
        <div style={{ display: 'flex', gap: 5, padding: '7px 9px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <MKpi label="Total a pagar"        value={money(totalDebt)} sub="Saldo pendiente" color="#111827" />
          <MKpi label="Facturas vencidas"    value={money(overdue)}   sub="Requieren atención" color="#dc2626" />
          <MKpi label="Facturas pendientes"  value={String(pending)}  sub="Por liquidar" color="#d97706" />
        </div>

        {/* Supplier chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderBottom: '1px solid #e5e7eb', background: '#fff', overflowX: 'auto' }}>
          <span style={{ fontSize: 8, color: '#9ca3af', flexShrink: 0 }}>Proveedor:</span>
          {['Todos','Distribuidora Norte','Bebidas del Sur','Golosinas SA'].map((s, i) => (
            <span key={s} style={{ fontSize: 8.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0, background: i === 0 ? '#111827' : '#f3f4f6', color: i === 0 ? '#fff' : '#374151', border: i === 0 ? 'none' : '1px solid #e5e7eb' }}>{s}</span>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 8.5, fontWeight: 700, color: '#0d9f6e', background: '#dcfce7', padding: '2px 8px', borderRadius: 7 }}>+ Proveedor</span>
            <span style={{ fontSize: 8.5, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 7 }}>+ Factura</span>
          </div>
        </div>

        {/* Invoices table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                {['Proveedor','Factura','Condición','Importe','Saldo','Estado',''].map(h => (
                  <th key={h} style={{ padding: '4px 7px', textAlign: 'left', fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', background: '#fff', letterSpacing: '.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: inv.isOverdue ? '#fff5f5' : '#fff' }}>
                  <td style={{ padding: '5px 7px', fontWeight: 700, fontSize: 9.5 }}>{inv.supplier}</td>
                  <td style={{ padding: '5px 7px', fontFamily: 'monospace', fontSize: 8.5, color: '#6b7280' }}>{inv.num}</td>
                  <td style={{ padding: '5px 7px', fontSize: 8.5 }}>{inv.condition}</td>
                  <td style={{ padding: '5px 7px', fontFamily: 'monospace', fontSize: 9 }}>{money(inv.amount)}</td>
                  <td style={{ padding: '5px 7px', fontFamily: 'monospace', fontSize: 9.5, fontWeight: 800, color: inv.saldo > 0 ? (inv.isOverdue ? '#dc2626' : '#374151') : '#0d9f6e' }}>{money(inv.saldo)}</td>
                  <td style={{ padding: '5px 7px' }}><Bdg text={statusLabel(inv.status)} variant={statusVariant(inv.status)} /></td>
                  <td style={{ padding: '5px 7px' }}>
                    {inv.saldo > 0 && <span style={{ fontSize: 8, fontWeight: 700, color: '#0d9f6e', background: '#dcfce7', padding: '2px 6px', borderRadius: 6 }}>Pagar</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Reportes ─────────────────────────────────────────────────────────

function ScreenReports() {
  const bars = [68, 82, 55, 91, 73, 98, 61, 85, 70, 88, 66, 94, 78, 87, 65, 92, 75, 83, 59, 96, 71, 89];
  const rubros = [
    { name: 'Bebidas',   pct: 32, color: '#2f6fed' },
    { name: 'Alimentos', pct: 24, color: '#0d9f6e'  },
    { name: 'Dulces',    pct: 18, color: '#f0653e'  },
    { name: 'Snacks',    pct: 14, color: '#7c5cff'  },
    { name: 'Otros',     pct: 12, color: '#d97706'  },
  ];
  const rotation = [
    { name: 'Gaseosa 1.5L',  qty: 124, total: 155000 },
    { name: 'Alfajor triple', qty: 98,  total: 63700  },
    { name: 'Leche entera',  qty: 87,  total: 95700  },
    { name: 'Chips 100g',    qty: 75,  total: 41250  },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <MTopbar title="Reportes" sub="Facturación, ganancia y rotación" />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Period filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
          <span style={{ fontSize: 8.5, color: '#9ca3af', fontWeight: 600 }}>Período:</span>
          {['Hoy','Esta semana','Este mes','Todo'].map((p, i) => (
            <span key={p} style={{ fontSize: 8.5, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: i === 2 ? '#0d9f6e' : '#f3f4f6', color: i === 2 ? '#fff' : '#6b7280' }}>{p}</span>
          ))}
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <MKpi label="Ventas"     value="148"        sub="Transacciones"  color="#111827" />
          <MKpi label="Facturado"  value="$184.300"   sub="Mes en curso"   color="#111827" />
          <MKpi label="Ganancia"   value="$55.100"    sub="Neta estimada"  color="#0d9f6e" />
          <MKpi label="Margen"     value="29.9%"      sub="Promedio"       color="#7c3aed" />
        </div>

        {/* Charts row */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Bar chart */}
          <div style={{ flex: 1, padding: '8px 10px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#374151', marginBottom: 6 }}>Facturación diaria</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 2, paddingBottom: 2 }}>
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: i === bars.length - 3 ? '#0d9f6e' : i % 7 === 6 ? '#bfdbfe' : '#dbeafe',
                    borderRadius: '2px 2px 0 0',
                    height: `${h}%`,
                    transition: 'height .3s ease',
                  }}
                />
              ))}
            </div>
            <div style={{ height: 1, background: '#e5e7eb', marginTop: 2 }} />
          </div>

          {/* Right: rubros + rotation */}
          <div style={{ width: 145, display: 'flex', flexDirection: 'column', padding: '8px 9px', overflowY: 'auto' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#374151', marginBottom: 5 }}>Por rubro</div>
            {rubros.map(r => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <span style={{ fontSize: 8.5, minWidth: 52, color: '#374151', fontWeight: 600 }}>{r.name}</span>
                <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
                  <div style={{ width: `${r.pct * 3}%`, height: '100%', background: r.color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 8.5, fontWeight: 700, color: '#6b7280', minWidth: 20, textAlign: 'right' }}>{r.pct}%</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 5, paddingTop: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#374151', marginBottom: 5 }}>Más vendidos</div>
              {rotation.map((r, i) => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 7.5, fontWeight: 800, color: '#9ca3af', marginRight: 4 }}>#{i+1}</span>
                    <span style={{ fontSize: 8.5, fontWeight: 600 }}>{r.name}</span>
                  </div>
                  <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#6b7280' }}>{r.qty}u.</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    nav: 0,
    icon: ShoppingCart,
    color: '#0d9f6e',
    bg: '#dcfce7',
    label: 'Punto de venta',
    title: 'Cobrás en segundos, con o sin impresora',
    desc: 'Buscás el producto o lo escaneás con la cámara. El sistema suma el total, aplicás descuento preestablecido y generás el comprobante en imagen para compartir por WhatsApp.',
    points: [
      'Escáner de código de barras con la cámara del celular',
      'Descuentos rápidos: 5%, 10%, 15% con un clic',
      'Comprobante en imagen — no necesitás impresora',
      'Opción de fiar la venta a un cliente directamente',
    ],
    Screen: ScreenPOS,
  },
  {
    nav: 1,
    icon: Package,
    color: '#f0653e',
    bg: '#ffedd5',
    label: 'Inventario inteligente',
    title: 'Cargás el costo, el sistema calcula el precio',
    desc: 'Ponés el costo de lista, el descuento del proveedor y el porcentaje de ganancia que querés. El precio de venta se calcula solo. El stock baja con cada venta.',
    points: [
      'Calcula precio de venta en tiempo real mientras cargás',
      'Ganancia por unidad visible antes de guardar',
      'Código de barras EAN-13 para escanear en el POS',
      'Alerta automática cuando el stock es bajo',
    ],
    Screen: ScreenInventory,
  },
  {
    nav: 2,
    icon: Users,
    color: '#7c3aed',
    bg: '#ede9fe',
    label: 'Clientes y fiados',
    title: 'Nunca perdés un peso de fiado',
    desc: 'Llevás la cuenta corriente de cada cliente. Podés fiar directamente desde el POS. Si cambiás el precio de un producto, los fiados se recalculan al valor actual.',
    points: [
      'Fiado directo desde el punto de venta',
      'Deuda actualizada automáticamente si cambiás precios',
      'Historial de pagos y pendientes por cliente',
      'Cobros en efectivo, transferencia o múltiples medios',
    ],
    Screen: ScreenCustomers,
  },
  {
    nav: 3,
    icon: Truck,
    color: '#2f6fed',
    bg: '#dbeafe',
    label: 'Proveedores',
    title: 'Control total de facturas y pagos',
    desc: 'Cargás cada factura con su condición de pago (contado, 15, 30, 60 días) y registrás los pagos parciales. Sabés exactamente cuánto debés y cuándo vence.',
    points: [
      'Condiciones de pago: contado, 15, 30, 60 o 90 días',
      'Alerta de facturas vencidas',
      'Pagos parciales con múltiples medios de pago',
      'Saldo en cuenta corriente por proveedor',
    ],
    Screen: ScreenSuppliers,
  },
  {
    nav: 4,
    icon: BarChart3,
    color: '#0891b2',
    bg: '#cffafe',
    label: 'Reportes y análisis',
    title: 'Tus números, actualizados al momento',
    desc: 'Cuánto facturaste, cuánto fue ganancia neta y qué productos tienen más rotación. Filtrás por hoy, semana, mes o cualquier rango de fechas.',
    points: [
      'Facturación y ganancia neta por período',
      'Breakdown por rubro con porcentajes',
      'Ranking de productos más vendidos',
      'Historial de ventas con detalle de cada ticket',
    ],
    Screen: ScreenReports,
  },
] as const;

// ─── Main component ───────────────────────────────────────────────────────────

export function ScrollDemo() {
  const [active, setActive] = useState(0);
  const stepEls = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs: IntersectionObserver[] = [];
    stepEls.current.forEach((el, i) => {
      if (!el) return;
      const o = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i); },
        { threshold: 0.5, rootMargin: '-8% 0px -8% 0px' },
      );
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach(o => o.disconnect());
  }, []);

  const step = STEPS[active];
  const mockH = 420;

  return (
    <section style={{ padding: '88px 0 112px', background: '#f8f7f3' }}>
      {/* Section heading */}
      <div style={{ textAlign: 'center', marginBottom: 72, padding: '0 24px' }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: '#f0653e' }}>
          Todo en uno
        </span>
        <h2 style={{ marginTop: 10, fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.15, color: '#111827' }}>
          Así se ve por adentro
        </h2>
        <p style={{ marginTop: 14, fontSize: 17, color: '#6b7280', maxWidth: 500, margin: '14px auto 0', lineHeight: 1.6 }}>
          Todo funciona desde el navegador. Sin instalar nada, sin configuración complicada.
        </p>
      </div>

      {/* ── Desktop ────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex"
        style={{ gap: 64, alignItems: 'flex-start', maxWidth: 1120, margin: '0 auto', padding: '0 48px' }}
      >
        {/* Sticky app window */}
        <div style={{ position: 'sticky', top: `calc((100vh - ${mockH + 30}px) / 2)`, flexBasis: '54%', flexShrink: 0 }}>
          {/* Browser chrome */}
          <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(17,24,39,.18)', border: '1px solid #d1d5db' }}>
            {/* Title bar */}
            <div style={{ height: 36, background: '#1c2333', display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', flexShrink: 0 }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => (
                <i key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, display: 'block', flexShrink: 0 }} />
              ))}
              <div style={{ flex: 1, margin: '0 12px', height: 20, borderRadius: 5, background: '#2d3748', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4b5563', flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace', transition: 'all .3s' }}>
                  ventra-arg.vercel.app/{step.label.toLowerCase().replace(/ /g, '-')}
                </span>
              </div>
            </div>

            {/* App shell */}
            <div style={{ height: mockH, display: 'flex', overflow: 'hidden' }}>
              {/* Sidebar */}
              <div style={{ width: 48, background: '#0f172a', display: 'flex', flexDirection: 'column', padding: '10px 0', gap: 2, flexShrink: 0 }}>
                {/* Logo */}
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#0d9f6e,#12c98a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#064e3b', margin: '0 auto 8px', flexShrink: 0 }}>
                  A
                </div>
                {SIDEBAR_ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = active === i;
                  return (
                    <div
                      key={item.label}
                      title={item.label}
                      style={{
                        width: 34, height: 34, borderRadius: 9, margin: '0 auto',
                        background: isActive ? STEPS[active]?.color : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background .35s',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} style={{ stroke: isActive ? '#fff' : 'rgba(255,255,255,.35)', transition: 'stroke .35s', flexShrink: 0 }} />
                    </div>
                  );
                })}
                {/* User avatar at bottom */}
                <div style={{ marginTop: 'auto', width: 30, height: 30, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto auto 6px', fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                  JG
                </div>
              </div>

              {/* Main content - screen transition */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {STEPS.map(({ Screen }, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute', inset: 0,
                      opacity: active === i ? 1 : 0,
                      transform: active === i ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.985)',
                      transition: 'opacity .4s cubic-bezier(.4,0,.2,1), transform .4s cubic-bezier(.4,0,.2,1)',
                      pointerEvents: active === i ? 'auto' : 'none',
                    }}
                  >
                    <Screen />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  height: 6, width: active === i ? 28 : 6, borderRadius: 3,
                  background: active === i ? s.color : '#d1d5db',
                  transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Scrolling steps */}
        <div style={{ flex: 1 }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = active === i;
            return (
              <div
                key={i}
                ref={el => { stepEls.current[i] = el; }}
                style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '40px 0' }}
              >
                <div style={{
                  transition: 'opacity .45s cubic-bezier(.4,0,.2,1), transform .45s cubic-bezier(.4,0,.2,1)',
                  opacity: isActive ? 1 : 0.22,
                  transform: isActive ? 'translateX(0)' : 'translateX(-12px)',
                }}>
                  {/* Label + icon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 15, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isActive ? `0 4px 16px ${s.color}30` : 'none', transition: 'box-shadow .4s' }}>
                      <Icon size={23} style={{ stroke: s.color }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.09em', color: s.color }}>{s.label}</span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(22px,2.4vw,32px)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-.025em', marginBottom: 14, color: '#111827' }}>
                    {s.title}
                  </h3>

                  {/* Desc */}
                  <p style={{ fontSize: 16, lineHeight: 1.75, color: '#4b5563', marginBottom: 24, maxWidth: 420 }}>
                    {s.desc}
                  </p>

                  {/* Points */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {s.points.map(pt => (
                      <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 11, fontSize: 14, color: '#374151', lineHeight: 1.5 }}>
                        <span style={{ marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 6, background: s.bg, flexShrink: 0, transition: 'background .3s' }}>
                          <Check size={10} style={{ stroke: s.color }} />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tablet (md) ─────────────────────────────────────────────────── */}
      <div
        className="hidden md:flex lg:hidden"
        style={{ gap: 40, alignItems: 'flex-start', maxWidth: 900, margin: '0 auto', padding: '0 32px' }}
      >
        {/* Sticky mock — smaller */}
        <div style={{ position: 'sticky', top: 32, flexBasis: '48%', flexShrink: 0 }}>
          <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 50px rgba(17,24,39,.15)', border: '1px solid #d1d5db' }}>
            <div style={{ height: 32, background: '#1c2333', display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px' }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => <i key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'block' }} />)}
              <span style={{ marginLeft: 8, fontSize: 9, color: '#6b7280', fontFamily: 'monospace' }}>ventra · {step.label.toLowerCase()}</span>
            </div>
            <div style={{ height: 320, display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: 38, background: '#0f172a', display: 'flex', flexDirection: 'column', padding: '8px 0', gap: 2, flexShrink: 0 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#0d9f6e,#12c98a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#064e3b', margin: '0 auto 6px' }}>A</div>
                {SIDEBAR_ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: 7, margin: '0 auto', background: active === i ? STEPS[active]?.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .35s' }}>
                      <Icon size={13} style={{ stroke: active === i ? '#fff' : 'rgba(255,255,255,.3)', transition: 'stroke .35s' }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {STEPS.map(({ Screen }, i) => (
                  <div key={i} style={{ position: 'absolute', inset: 0, opacity: active === i ? 1 : 0, transform: active === i ? 'scale(1)' : 'scale(0.97)', transition: 'opacity .4s, transform .4s', pointerEvents: active === i ? 'auto' : 'none' }}>
                    <Screen />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
            {STEPS.map((s, i) => <div key={i} style={{ height: 5, width: active === i ? 22 : 5, borderRadius: 3, background: active === i ? s.color : '#d1d5db', transition: 'all .35s' }} />)}
          </div>
        </div>

        {/* Steps */}
        <div style={{ flex: 1 }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = active === i;
            return (
              <div key={i} ref={el => { stepEls.current[i] = el; }} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', padding: '28px 0' }}>
                <div style={{ opacity: isActive ? 1 : 0.2, transform: isActive ? 'none' : 'translateX(-8px)', transition: 'all .45s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={19} style={{ stroke: s.color }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: s.color }}>{s.label}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 20, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: 10, color: '#111827' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#4b5563', marginBottom: 16 }}>{s.desc}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {s.points.map(pt => (
                      <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 8, fontSize: 13, color: '#374151' }}>
                        <span style={{ marginTop: 3, width: 16, height: 16, borderRadius: 5, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={9} style={{ stroke: s.color }} />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile ──────────────────────────────────────────────────────── */}
      <div className="md:hidden" style={{ padding: '0 20px' }}>
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const Screen = s.Screen;
          return (
            <div key={i} style={{ marginBottom: 52 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ stroke: s.color }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: s.color }}>{s.label}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 20, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: 10, color: '#111827' }}>{s.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#4b5563', marginBottom: 18 }}>{s.desc}</p>

              {/* Mini mock */}
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #d1d5db', boxShadow: '0 8px 28px rgba(17,24,39,.12)', marginBottom: 18, height: 240 }}>
                <div style={{ height: 26, background: '#1c2333', display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px' }}>
                  {['#ff5f57','#febc2e','#28c840'].map(c => <i key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'block' }} />)}
                  <span style={{ marginLeft: 6, fontSize: 8, color: '#6b7280', fontFamily: 'monospace' }}>ventra · {s.label.toLowerCase()}</span>
                </div>
                <div style={{ height: 214, display: 'flex', overflow: 'hidden' }}>
                  <div style={{ width: 32, background: '#0f172a', display: 'flex', flexDirection: 'column', padding: '6px 0', gap: 2, flexShrink: 0 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#0d9f6e,#12c98a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#064e3b', margin: '0 auto 4px' }}>A</div>
                    {SIDEBAR_ITEMS.map((item, j) => {
                      const SIcon = item.icon;
                      return (
                        <div key={j} style={{ width: 24, height: 24, borderRadius: 6, margin: '0 auto', background: i === j ? s.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <SIcon size={11} style={{ stroke: i === j ? '#fff' : 'rgba(255,255,255,.3)' }} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', transform: 'scale(0.88)', transformOrigin: 'top left', width: 'calc(100% / 0.88)', height: 'calc(100% / 0.88)' }}>
                    <Screen />
                  </div>
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {s.points.map(pt => (
                  <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 8, fontSize: 13, color: '#374151' }}>
                    <span style={{ marginTop: 3, width: 16, height: 16, borderRadius: 5, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={9} style={{ stroke: s.color }} />
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
