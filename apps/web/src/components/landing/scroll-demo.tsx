'use client';
import { useState, useRef, useEffect } from 'react';
import {
  ShoppingCart, Package, Users, TrendingUp,
  Search, Plus, Minus, Check,
} from 'lucide-react';

const P = '#0d9f6e';

// ─── Screen Mocks ────────────────────────────────────────────────────────────

function ScreenPOS() {
  const cart = [
    { name: 'Gaseosa 1.5L', price: 1250, qty: 2 },
    { name: 'Alfajor triple', price: 650, qty: 1 },
    { name: 'Chips 100g', price: 550, qty: 3 },
  ];
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #e6eaf0', display: 'flex', alignItems: 'center', gap: 7, background: '#fff' }}>
        <Search size={13} style={{ stroke: '#8a93a3', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: '#8a93a3' }}>Buscar o escanear producto…</span>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: 9, overflowY: 'auto', borderRight: '1px solid #e6eaf0', background: '#f8f9fb' }}>
          <p style={{ fontSize: 8, fontWeight: 800, color: '#8a93a3', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>Bebidas</p>
          {[['Gaseosa 1.5L', 1250], ['Agua 500ml', 450], ['Jugo 1L', 850], ['Cerveza 473ml', 950]].map(([n, pr]) => (
            <div key={String(n)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', borderRadius: 8, marginBottom: 4, background: '#fff', border: '1px solid #e6eaf0' }}>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{n}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: P }}>${Number(pr).toLocaleString('es-AR')}</span>
                <div style={{ width: 18, height: 18, borderRadius: 5, background: P, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={10} style={{ stroke: '#fff' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ width: 155, padding: 9, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          <p style={{ fontSize: 8, fontWeight: 800, color: '#8a93a3', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>Carrito</p>
          <div style={{ flex: 1 }}>
            {cart.map(item => (
              <div key={item.name} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, marginBottom: 3 }}>
                  <span style={{ maxWidth: 82, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                  <span style={{ fontFamily: 'monospace' }}>${(item.price * item.qty).toLocaleString('es-AR')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: '#f3f5f8', border: '1px solid #e6eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={8} style={{ stroke: '#5d6b5f' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, minWidth: 14, textAlign: 'center' }}>{item.qty}</span>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: '#f3f5f8', border: '1px solid #e6eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={8} style={{ stroke: '#5d6b5f' }} />
                  </div>
                  <span style={{ fontSize: 9, color: '#8a93a3', marginLeft: 2 }}>${item.price.toLocaleString('es-AR')}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #e6eaf0', paddingTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#5d6b5f', textTransform: 'uppercase' }}>Total</span>
              <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 900 }}>${total.toLocaleString('es-AR')}</span>
            </div>
            <div style={{ width: '100%', background: P, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 0', fontSize: 11, fontWeight: 800, textAlign: 'center', boxShadow: '0 4px 12px rgba(13,159,110,.35)' }}>
              Cobrar →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenInventory() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #e6eaf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['Bebidas', 'Alimentos', 'Galletitas', 'Otros'].map((c, i) => (
            <span key={c} style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: i === 0 ? P : '#f3f5f8', color: i === 0 ? '#fff' : '#5d6b5f' }}>{c}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: P, color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 9, fontWeight: 800 }}>
          <Plus size={9} style={{ stroke: '#fff' }} /> Nuevo
        </div>
      </div>
      <div style={{ flex: 1, padding: '8px 10px', overflowY: 'auto', background: '#f8f9fb' }}>
        {[
          { name: 'Gaseosa 1.5L',  cost: 800,  price: 1250, stock: 24, warn: false },
          { name: 'Agua 500ml',    cost: 280,  price: 450,  stock: 8,  warn: false },
          { name: 'Jugo 1L',       cost: 520,  price: 850,  stock: 3,  warn: true  },
          { name: 'Cerveza 473ml', cost: 650,  price: 950,  stock: 18, warn: false },
          { name: 'Soda 1.5L',     cost: 400,  price: 680,  stock: 5,  warn: true  },
        ].map(item => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px', marginBottom: 4, borderRadius: 10, background: '#fff', border: `1px solid ${item.warn ? '#fde8e8' : '#e6eaf0'}` }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: item.warn ? '#fde8e8' : '#f3f5f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={13} style={{ stroke: item.warn ? '#e53e3e' : '#8a93a3' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{item.name}</span>
                {item.warn && <span style={{ fontSize: 8, fontWeight: 800, color: '#e53e3e', background: '#fde8e8', padding: '1px 5px', borderRadius: 8 }}>Stock bajo</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 9, color: '#8a93a3' }}>
                <span>Costo <b style={{ color: '#1a1c1a' }}>${item.cost.toLocaleString('es-AR')}</b></span>
                <span>Precio <b style={{ color: P }}>${item.price.toLocaleString('es-AR')}</b></span>
                <span>Stock <b style={{ color: item.warn ? '#e53e3e' : '#1a1c1a' }}>{item.stock}</b></span>
              </div>
            </div>
            <span style={{ fontSize: 9, color: '#2f6fed', fontWeight: 700, flexShrink: 0 }}>✏ Editar</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenCustomers() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #e6eaf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <span style={{ fontSize: 11, fontWeight: 800 }}>Clientes y fiados</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#7c5cff', color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 9, fontWeight: 800 }}>
          <Plus size={9} style={{ stroke: '#fff' }} /> Cliente
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: '44%', borderRight: '1px solid #e6eaf0', padding: '8px 7px', overflowY: 'auto', background: '#f8f9fb' }}>
          {[
            { name: 'María González', debt: 4750, active: true  },
            { name: 'Roberto Sánchez',debt: 1200, active: false },
            { name: 'Carlos Ruiz',    debt: 0,    active: false },
            { name: 'Ana López',      debt: 3100, active: false },
          ].map(c => (
            <div key={c.name} style={{ padding: '7px 8px', borderRadius: 9, marginBottom: 4, background: c.active ? '#efeaff' : '#fff', border: `1px solid ${c.active ? '#c9beff' : '#e6eaf0'}`, cursor: 'pointer' }}>
              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>{c.name}</div>
              <div style={{ fontSize: 9, color: c.debt > 0 ? '#e53e3e' : P, fontWeight: 600 }}>
                {c.debt > 0 ? `Debe $${c.debt.toLocaleString('es-AR')}` : '✓ Al día'}
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '8px 9px', overflowY: 'auto', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f3f5f8' }}>
            <span style={{ fontSize: 10, fontWeight: 800 }}>María González</span>
            <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 900, color: '#e53e3e' }}>$4.750</span>
          </div>
          {[
            { date: '15/06', desc: 'Gaseosa 1.5L × 2', amt: '+$2.500', neg: true  },
            { date: '14/06', desc: 'Pago parcial',      amt: '−$1.050', neg: false },
            { date: '12/06', desc: 'Leche + Alfajor',   amt: '+$3.300', neg: true  },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f3f5f8', fontSize: 9 }}>
              <div>
                <span style={{ color: '#8a93a3', marginRight: 5 }}>{t.date}</span>
                <span style={{ fontWeight: 600 }}>{t.desc}</span>
              </div>
              <span style={{ fontWeight: 800, color: t.neg ? '#e53e3e' : P, fontFamily: 'monospace' }}>{t.amt}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, background: '#efeaff', color: '#6b46ff', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 10, fontWeight: 700, textAlign: 'center' }}>
            + Registrar fiado
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenReports() {
  const bars = [55, 72, 60, 85, 68, 92, 58, 79, 70, 88, 64, 96, 74, 82];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #e6eaf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <span style={{ fontSize: 11, fontWeight: 800 }}>Reportes — Junio 2026</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Semana', 'Mes', 'Año'].map((p, i) => (
            <span key={p} style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: i === 1 ? P : '#f3f5f8', color: i === 1 ? '#fff' : '#8a93a3' }}>{p}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, padding: '8px 10px', borderBottom: '1px solid #e6eaf0' }}>
        {[
          { label: 'Facturado', value: '$84.300', color: '#1a1c1a' },
          { label: 'Ganancia',  value: '$25.100', color: P         },
          { label: 'Margen',    value: '29.8%',   color: '#7c5cff' },
        ].map(k => (
          <div key={k.label} style={{ flex: 1, background: '#fff', border: '1px solid #e6eaf0', borderRadius: 9, padding: '6px 8px' }}>
            <div style={{ fontSize: 7, color: '#8a93a3', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>{k.label}</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 12, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', background: '#f8f9fb' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 3, paddingBottom: 4 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, background: i === bars.length - 3 ? P : '#c8e8dc', borderRadius: '3px 3px 0 0', height: `${h}%`, transition: 'height 0.4s ease' }} />
          ))}
        </div>
        <div style={{ height: 1, background: '#e6eaf0', marginBottom: 8 }} />
        <div>
          <p style={{ fontSize: 8, fontWeight: 800, color: '#8a93a3', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Más vendido</p>
          {[['Gaseosas', 38, P], ['Alfajores', 26, '#f0653e'], ['Chips', 20, '#7c5cff']].map(([nm, pct, col]) => (
            <div key={String(nm)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span style={{ fontSize: 9, minWidth: 58, color: '#1a1c1a', fontWeight: 600 }}>{nm}</span>
              <div style={{ flex: 1, height: 5, borderRadius: 4, background: '#e6eaf0', overflow: 'hidden' }}>
                <div style={{ width: `${Number(pct) * 2.5}%`, height: '100%', background: String(col), borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, minWidth: 22, textAlign: 'right', color: '#5d6b5f' }}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step Config ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    icon: ShoppingCart,
    color: '#0d9f6e',
    bg: '#e2f4ec',
    label: 'Punto de venta',
    title: 'Cobrá en segundos',
    desc: 'Buscás el producto o lo escaneás con la cámara del celular. El sistema suma el total y emite el comprobante para compartir por WhatsApp.',
    points: [
      'Escáner de código de barras desde el celular',
      'Descuentos por porcentaje o monto fijo',
      'Comprobante en imagen, sin necesidad de impresora',
    ],
    Screen: ScreenPOS,
  },
  {
    icon: Package,
    color: '#f0653e',
    bg: '#fdeae3',
    label: 'Inventario y stock',
    title: 'Controlá lo que entra y sale',
    desc: 'Cargás los artículos por rubro con su costo y precio de venta. Cada vez que vendés, el stock baja solo. Y te avisa cuando queda poco.',
    points: [
      'Costo y precio de venta por producto',
      'Alerta automática cuando el stock es bajo',
      'Ajuste de precios masivo por rubro',
    ],
    Screen: ScreenInventory,
  },
  {
    icon: Users,
    color: '#7c5cff',
    bg: '#efeaff',
    label: 'Clientes y fiados',
    title: 'Nunca perdés un peso de fiado',
    desc: 'Anotás lo que se llevan tus clientes regulares. Ven cuánto deben, cuánto pagaron y el saldo actualizado al precio del día.',
    points: [
      'Cuenta corriente por cliente',
      'Saldo se actualiza si cambiás el precio',
      'Historial de pagos y fiados',
    ],
    Screen: ScreenCustomers,
  },
  {
    icon: TrendingUp,
    color: '#2f6fed',
    bg: '#e8f0fe',
    label: 'Reportes',
    title: 'Mirá tu negocio en tiempo real',
    desc: 'Cuánto facturaste, cuánto fue ganancia y qué productos tienen más rotación. Los números que importan, actualizados en el momento.',
    points: [
      'Facturación y ganancia neta diaria / mensual',
      'Ranking de productos más vendidos',
      'Comparativa entre períodos',
    ],
    Screen: ScreenReports,
  },
] as const;

// ─── Main Component ───────────────────────────────────────────────────────────

const ACCENT = '#f0653e';

export function ScrollDemo() {
  const [active, setActive] = useState(0);
  const stepEls = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs: IntersectionObserver[] = [];
    stepEls.current.forEach((el, i) => {
      if (!el) return;
      const o = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i); },
        { threshold: 0.55, rootMargin: '-10% 0px -10% 0px' },
      );
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach(o => o.disconnect());
  }, []);

  const step = STEPS[active];

  return (
    <section style={{ padding: '80px 0 100px', background: '#fbf8f1' }}>
      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: 64, padding: '0 24px' }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: ACCENT }}>
          Así se usa
        </span>
        <h2 style={{ marginTop: 8, fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.2 }}>
          De la compra al cierre,<br />en un solo lugar
        </h2>
        <p style={{ marginTop: 12, fontSize: 17, color: '#5d6b5f', maxWidth: 480, margin: '12px auto 0' }}>
          Sin instalación ni configuración. Abrís el navegador y estás vendiendo.
        </p>
      </div>

      {/* ── Desktop layout ─────────────────────────────────────────────── */}
      <div
        className="hidden md:flex"
        style={{ gap: 56, alignItems: 'flex-start', maxWidth: 1080, margin: '0 auto', padding: '0 40px' }}
      >
        {/* Sticky left: app window */}
        <div style={{ position: 'sticky', top: 'calc((100vh - 440px) / 2)', flexBasis: '52%', flexShrink: 0 }}>
          {/* Browser chrome */}
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e0ddd6', boxShadow: '0 28px 70px rgba(26,28,26,.16)' }}>
            {/* Title bar */}
            <div style={{ height: 36, background: '#11161d', display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px' }}>
              {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                <i key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'block' }} />
              ))}
              <span style={{ marginLeft: 10, color: '#8a93a3', fontSize: 10, fontFamily: 'monospace', transition: 'all .3s' }}>
                ventra · {step.label.toLowerCase()}
              </span>
            </div>

            {/* App shell */}
            <div style={{ position: 'relative', height: 350, overflow: 'hidden', display: 'flex' }}>
              {/* Sidebar */}
              <div style={{ width: 44, background: '#11161d', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 8, flexShrink: 0, zIndex: 2 }}>
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={i}
                      style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: active === i ? s.color : 'rgba(255,255,255,.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background .35s',
                      }}
                    >
                      <Icon size={14} style={{ stroke: active === i ? '#fff' : '#8a93a3', transition: 'stroke .35s' }} />
                    </div>
                  );
                })}
              </div>

              {/* Screens */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {STEPS.map(({ Screen }, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute', inset: 0,
                      opacity: active === i ? 1 : 0,
                      transform: active === i ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.975)',
                      transition: 'opacity .45s ease, transform .45s ease',
                      pointerEvents: active === i ? 'auto' : 'none',
                    }}
                  >
                    <Screen />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 18 }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  height: 6,
                  width: active === i ? 22 : 6,
                  borderRadius: 3,
                  background: active === i ? s.color : '#ddd8ce',
                  transition: 'all .35s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Scrolling right: step text */}
        <div style={{ flex: 1 }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = active === i;
            return (
              <div
                key={i}
                ref={el => { stepEls.current[i] = el; }}
                style={{ minHeight: '78vh', display: 'flex', alignItems: 'center', padding: '32px 0' }}
              >
                <div style={{ transition: 'opacity .4s, transform .4s', opacity: isActive ? 1 : 0.28, transform: isActive ? 'none' : 'translateX(-10px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={22} style={{ stroke: s.color }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: s.color }}>{s.label}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: 14 }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 16, lineHeight: 1.75, color: '#5d6b5f', marginBottom: 22, maxWidth: 400 }}>
                    {s.desc}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {s.points.map(pt => (
                      <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 14, color: '#3a3d3a' }}>
                        <span style={{ marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 6, background: s.bg, flexShrink: 0 }}>
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

      {/* ── Mobile layout ──────────────────────────────────────────────── */}
      <div className="md:hidden" style={{ padding: '0 20px' }}>
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const Screen = s.Screen;
          return (
            <div key={i} style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ stroke: s.color }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: s.color }}>{s.label}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 22, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: 10 }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#5d6b5f', marginBottom: 16 }}>{s.desc}</p>

              {/* Mini screen preview */}
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e0ddd6', boxShadow: '0 8px 24px rgba(26,28,26,.1)', height: 220 }}>
                <div style={{ height: 28, background: '#11161d', display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px' }}>
                  {['#ff5f57','#febc2e','#28c840'].map(c => <i key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'block' }} />)}
                </div>
                <div style={{ height: 192, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: 36, background: '#11161d', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 6 }}>
                    {STEPS.map((ss, j) => {
                      const SIcon = ss.icon;
                      return (
                        <div key={j} style={{ width: 26, height: 26, borderRadius: 7, background: i === j ? ss.color : 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <SIcon size={12} style={{ stroke: i === j ? '#fff' : '#8a93a3' }} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', transform: 'scale(0.92)', transformOrigin: 'top left', width: 'calc(100% / 0.92)' }}>
                    <Screen />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
