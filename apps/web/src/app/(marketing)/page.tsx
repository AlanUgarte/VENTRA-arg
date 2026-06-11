'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Check, ChevronDown, TrendingUp } from 'lucide-react';
import { ScrollDemo } from '@/components/landing/scroll-demo';

const PRIMARY = '#0d9f6e';
const ACCENT  = '#f0653e';

const FEATURES = [
  { title: 'Caja con ticket',        desc: 'Sumás los productos, aplicás descuento y generás la venta. El stock se descuenta solo.',             color: PRIMARY, bg: '#e2f4ec' },
  { title: 'Comprobante en imagen',  desc: 'Cada venta genera un comprobante que compartís por WhatsApp. Lo abre cualquiera desde el celu.',     color: ACCENT,  bg: '#fdeae3' },
  { title: 'Inventario y stock',     desc: 'Cargás artículos por rubro con costo y ganancia. Editás precios cuando querés.',                      color: '#9a6c00',bg: '#fdf2d8' },
  { title: 'Clientes y fiados',      desc: 'Llevás la cuenta de quién te debe. Si cambiás un precio, la deuda se ajusta al valor de hoy.',       color: '#7c5cff',bg: '#efeaff' },
  { title: 'Pago a proveedores',     desc: 'Cargás facturas con su condición y vencimiento, anotás cada pago y ves el saldo en cuenta corriente.',color: '#2f6fed',bg: '#e8f0fe' },
  { title: 'Reportes y gráficos',    desc: 'Mirás cuánto facturaste, tu ganancia neta y qué productos tienen más rotación.',                      color: '#06b6d4',bg: '#e0f7fb' },
];

const FAQS = [
  { q: '¿Necesito instalar algo?',                          a: 'No. Funciona desde el navegador en cualquier compu, tablet o celular. También en iPhone y Android.' },
  { q: '¿Puede usarlo más de una persona a la vez?',        a: 'Sí. El plan incluye 1 dueño y hasta 2 cajeros simultáneos. Cada uno con su usuario, contraseña y permisos separados.' },
  { q: 'Si cambio un precio, ¿se actualiza lo que me deben?', a: 'Exacto. Los fiados se calculan siempre al precio del día.' },
  { q: '¿Cómo es la prueba gratis?',                        a: '7 días con todo habilitado. Sin tarjeta de crédito. Si te sirve, elegís tu plan y pagás.' },
  { q: '¿Cómo se paga?',                                    a: 'Podés pagar con Mercado Pago (cobro automático mensual) o por transferencia bancaria. Con MP se activa al instante.' },
  { q: '¿Puedo escanear códigos de barras?',                a: 'Sí. Desde el celular usás la cámara para escanear en el punto de venta. En la compu podés conectar un lector de códigos USB.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="font-sans antialiased" style={{ background: '#fbf8f1', color: '#1a1c1a' }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(251,248,241,.92)', backdropFilter: 'blur(12px)', borderColor: '#e7e0d2' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5 font-extrabold text-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg font-black" style={{ background: 'linear-gradient(135deg,#0d9f6e,#12c98a)', color: '#053b2b', boxShadow: '0 6px 14px rgba(13,159,110,.35)' }}>A</span>
              VENTRA ARG
            </div>

            {/* Desktop links */}
            <div className="hidden items-center gap-6 md:flex">
              <a href="#funciones" className="text-sm font-semibold" style={{ color: '#5d6b5f' }}>Funciones</a>
              <a href="#precio"    className="text-sm font-semibold" style={{ color: '#5d6b5f' }}>Precio</a>
              <a href="#faq"       className="text-sm font-semibold" style={{ color: '#5d6b5f' }}>Preguntas</a>
              <Link href="/login"  className="text-sm font-semibold" style={{ color: '#5d6b5f' }}>Entrar</Link>
              <Link href="/register" className="rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ background: PRIMARY, boxShadow: '0 6px 16px rgba(13,159,110,.28)' }}>
                Probar gratis
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-xl border md:hidden" style={{ borderColor: '#e7e0d2' }} onClick={() => setMobileNav(v => !v)}>
              <span className={`block h-0.5 w-5 bg-current transition-all ${mobileNav ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-5 bg-current transition-all ${mobileNav ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-current transition-all ${mobileNav ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>
          </div>

          {/* Mobile menu */}
          {mobileNav && (
            <div className="border-t pb-4 pt-2 md:hidden" style={{ borderColor: '#e7e0d2' }}>
              {['#funciones|Funciones','#precio|Precio','#faq|Preguntas'].map(item => {
                const [href, label] = item.split('|');
                return (
                  <a key={href} href={href} onClick={() => setMobileNav(false)}
                    className="block px-2 py-3 text-sm font-semibold" style={{ color: '#5d6b5f' }}>
                    {label}
                  </a>
                );
              })}
              <div className="mt-2 flex flex-col gap-2">
                <Link href="/login" className="rounded-xl border px-4 py-3 text-center text-sm font-bold" style={{ borderColor: '#e7e0d2' }} onClick={() => setMobileNav(false)}>Iniciar sesión</Link>
                <Link href="/register" className="rounded-xl px-4 py-3 text-center text-sm font-bold text-white" style={{ background: PRIMARY }} onClick={() => setMobileNav(false)}>Probar gratis 7 días</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pt-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold" style={{ background: '#e2f4ec', color: '#0a7e57', borderColor: '#bfe8d6' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: PRIMARY }} />
              Para kioscos y almacenes de barrio
            </span>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl" style={{ letterSpacing: '-.02em' }}>
              Tu kiosco, <em className="not-italic" style={{ color: PRIMARY }}>ordenado</em> y bajo control.
            </h1>
            <p className="mt-4 text-lg leading-relaxed sm:mt-5" style={{ color: '#5d6b5f' }}>
              Cargá tus productos, cobrá con ticket, llevá el stock, los fiados y los pagos a proveedores. Todo desde la compu o el celular.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="rounded-2xl px-6 py-4 text-center text-base font-bold text-white shadow-lg" style={{ background: PRIMARY, boxShadow: '0 8px 24px rgba(13,159,110,.3)' }}>
                Probar gratis 7 días
              </Link>
              <Link href="/login" className="rounded-2xl border px-6 py-4 text-center text-base font-bold" style={{ borderColor: '#e7e0d2', background: '#fff' }}>
                Iniciar sesión →
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold" style={{ color: '#5d6b5f' }}>
              {['Sin instalar nada', 'Funciona en el celular', '7 días gratis'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={15} style={{ stroke: PRIMARY }} /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Mock — hidden on small mobile */}
          <div className="hidden sm:block" style={{ borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 70px rgba(26,28,26,.16)', border: '1px solid #e7e0d2', transform: 'rotate(.5deg)' }}>
            <div style={{ height: 38, background: '#11161d', display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px' }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => <i key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, display: 'block' }} />)}
              <span style={{ marginLeft: 10, color: '#8a93a3', fontSize: 11, fontFamily: 'monospace' }}>almacén · punto de venta</span>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: 52, background: '#11161d', padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
                {[true,false,false,false].map((on, i) => <i key={i} style={{ width: 22, height: 22, borderRadius: 7, background: on ? PRIMARY : 'rgba(255,255,255,.08)', display: 'block' }} />)}
              </div>
              <div style={{ flex: 1, padding: 14, background: '#f3f5f8' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {[{l:'Facturado',v:'$84.300',c:'#1a1c1a'},{l:'Ganancia',v:'$25.100',c:PRIMARY},{l:'Por cobrar',v:'$4.745',c:ACCENT}].map(k => (
                    <div key={k.l} style={{ flex: 1, background: '#fff', border: '1px solid #e6eaf0', borderRadius: 9, padding: 8 }}>
                      <b style={{ fontSize: 8, color: '#8a93a3', textTransform: 'uppercase' }}>{k.l}</b>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13, marginTop: 2, color: k.c }}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                  {[['Bebidas','Gaseosa','$3.780'],['Alimentos','Leche 1L','$1.250'],['Galletitas','Surtidas','$2.465']].map(([r,n,p]) => (
                    <div key={n} style={{ background: '#fff', border: '1px solid #e6eaf0', borderRadius: 8, padding: 8 }}>
                      <span style={{ fontSize: 8, color: '#0a7e57', background: '#e2f4ec', padding: '1px 5px', borderRadius: 8, fontWeight: 700 }}>{r}</span>
                      <div style={{ fontSize: 10, fontWeight: 700, margin: '5px 0 2px' }}>{n}</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{p}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCROLL DEMO */}
      <ScrollDemo />

      {/* FEATURES */}
      <section id="funciones" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-10 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: ACCENT }}>Todo en un solo lugar</span>
          <h2 className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl">Lo que podés hacer</h2>
          <p className="mt-3 text-base sm:text-lg" style={{ color: '#5d6b5f' }}>Pensado para el día a día del mostrador.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, desc, color, bg }) => (
            <div key={title} className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: '#e7e0d2' }}>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: bg }}>
                <TrendingUp size={22} style={{ stroke: color, fill: 'none' }} />
              </div>
              <h3 className="mb-2 text-lg font-extrabold">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#5d6b5f' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MULTIUSER */}
      <section id="multiusuario" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl p-8 sm:p-12" style={{ background: 'linear-gradient(135deg,#0e1a16,#10261d)', color: '#fff' }}>
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">Varios usuarios, al mismo tiempo</h2>
              <p className="mt-3 text-base" style={{ color: '#bfd3c9' }}>Vos en el mostrador, tu empleado en la otra caja. Todos conectados a la vez.</p>
              <ul className="mt-5 space-y-3">
                {['Creás un usuario para cada persona del local','Acceso simultáneo desde varias cajas','Cada uno con su usuario y contraseña','Se ve igual en compu, tablet y celular'].map(t => (
                  <li key={t} className="flex items-start gap-3 text-sm" style={{ color: '#e7efe9' }}>
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: PRIMARY }}>
                      <Check size={11} style={{ stroke: '#fff' }} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)' }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#9fb3a8' }}>Conectados ahora</p>
              {[['M','#0d9f6e','Mostrador 1','Caja principal'],['C','#f0653e','Caja 2','Empleado'],['D','#7c5cff','Dueño','Desde el celular']].map(([i,c,n,r]) => (
                <div key={n} className="flex items-center gap-3 border-b py-3 last:border-0" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: c }}>{i}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{n}</p>
                    <p className="text-xs" style={{ color: '#9fb3a8' }}>{r}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#28c840' }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#28c840' }} /> En línea
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precio" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-10 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: ACCENT }}>Un solo plan</span>
          <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Simple y sin letra chica</h2>
          <p className="mt-3" style={{ color: '#5d6b5f' }}>7 días gratis · no pedimos tarjeta · cancelás cuando querés</p>
        </div>
        <div className="max-w-sm mx-auto">
          <div className="relative rounded-3xl p-7 shadow-xl" style={{ background: '#fff', border: '2px solid #0d9f6e', boxShadow: '0 16px 40px rgba(13,159,110,.15)' }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-extrabold text-white" style={{ background: PRIMARY }}>
              TODO INCLUIDO
            </div>
            <div className="rounded-2xl p-5 -mx-1 mb-5" style={{ background: 'linear-gradient(135deg,#0d9f6e,#12c98a)' }}>
              <p className="text-xs font-extrabold uppercase tracking-widest text-white/80">Plan Completo</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">$</span>
                <span className="font-serif text-5xl font-black text-white">24.990</span>
                <span className="text-sm font-semibold text-white/80">/mes</span>
              </div>
              <p className="mt-1 text-sm text-white/90">1 dueño + hasta 2 cajeros simultáneos</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {[
                'Punto de venta con ticket y comprobante',
                'Inventario, stock y control de precios',
                'Clientes, fiados y cuenta corriente',
                'Proveedores con múltiples medios de pago',
                'Reportes, gráficos y respaldos',
                '1 dueño + hasta 2 cajeros simultáneos',
                'Ganancia visible solo para el dueño',
              ].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full" style={{ background: '#e2f4ec' }}>
                    <Check size={10} style={{ stroke: '#0a7e57' }} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block rounded-2xl py-3.5 text-center text-sm font-extrabold text-white shadow-lg" style={{ background: PRIMARY, boxShadow: '0 8px 20px rgba(13,159,110,.3)' }}>
              Empezar prueba gratis — 7 días
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="mb-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: ACCENT }}>Dudas</span>
          <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border" style={{ background: '#fff', borderColor: '#e7e0d2' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-bold"
              >
                {faq.q}
                <ChevronDown size={18} style={{ color: PRIMARY, transition: '.2s', transform: openFaq === i ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
              </button>
              {openFaq === i && (
                <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#5d6b5f' }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl px-6 py-12 text-center sm:px-12" style={{ background: '#f4eee1' }}>
          <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">Empezá a ordenar tu kiosco hoy</h2>
          <p className="mx-auto mt-3 max-w-md text-base sm:text-lg" style={{ color: '#5d6b5f' }}>
            Probalo 7 días gratis. En cinco minutos ya estás cobrando.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register" className="w-full rounded-2xl px-8 py-4 text-center text-base font-bold text-white sm:w-auto" style={{ background: PRIMARY, boxShadow: '0 8px 24px rgba(13,159,110,.28)' }}>
              Crear mi usuario gratis
            </Link>
            <Link href="/login" className="w-full rounded-2xl border px-8 py-4 text-center text-base font-bold sm:w-auto" style={{ borderColor: '#e7e0d2', background: '#fff' }}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t" style={{ borderColor: '#e7e0d2' }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4" style={{ color: '#5d6b5f', fontSize: 13.5 }}>
            <div className="flex items-center gap-2.5 text-base font-extrabold" style={{ color: '#1a1c1a' }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg font-black" style={{ background: 'linear-gradient(135deg,#0d9f6e,#12c98a)', color: '#053b2b', fontSize: 15 }}>A</span>
              VENTRA ARG
            </div>
            <p className="text-xs sm:text-sm">Sistema de gestión para kioscos y almacenes · Hecho en Argentina 🇦🇷</p>
            <div className="flex gap-4 text-xs">
              <Link href="/privacy" style={{ color: '#5d6b5f', textDecoration: 'none' }} className="hover:underline">Política de privacidad</Link>
              <Link href="/terms"   style={{ color: '#5d6b5f', textDecoration: 'none' }} className="hover:underline">Términos de uso</Link>
              <a href="mailto:ugartemultiproductos@gmail.com" style={{ color: '#5d6b5f', textDecoration: 'none' }} className="hover:underline">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
