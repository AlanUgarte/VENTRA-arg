'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  ShoppingCart, FileImage, Package, Users, Truck, BarChart3,
  Check, ChevronDown, TrendingUp, Wifi,
} from 'lucide-react';

const PRIMARY = '#0d9f6e';
const ACCENT = '#f0653e';

const FEATURES = [
  {
    icon: ShoppingCart,
    title: 'Caja con ticket',
    desc: 'Sumás los productos al ticket del cliente, aplicás descuento y generás la venta. El stock se descuenta solo.',
    color: PRIMARY,
    bg: '#e2f4ec',
  },
  {
    icon: FileImage,
    title: 'Comprobante en imagen',
    desc: 'Cada venta genera un comprobante que descargás o compartís por WhatsApp. Lo abre cualquiera, desde el celu o la PC.',
    color: ACCENT,
    bg: '#fdeae3',
  },
  {
    icon: Package,
    title: 'Inventario y stock',
    desc: 'Cargás artículos por rubro con costo, descuento y ganancia. Editás precios cuando querés y controlás lo que queda.',
    color: '#9a6c00',
    bg: '#fdf2d8',
  },
  {
    icon: Users,
    title: 'Clientes y fiados',
    desc: 'Llevás la cuenta de quién te debe, buscás por nombre y si cambiás un precio, la deuda se ajusta al valor de hoy.',
    color: '#7c5cff',
    bg: '#efeaff',
  },
  {
    icon: Truck,
    title: 'Pago a proveedores',
    desc: 'Cargás facturas con su condición y vencimiento, anotás cada pago y ves el saldo en cuenta corriente.',
    color: '#2f6fed',
    bg: '#e8f0fe',
  },
  {
    icon: BarChart3,
    title: 'Reportes y gráficos',
    desc: 'Mirás cuánto facturaste, tu ganancia neta y qué productos tienen más rotación, con gráficos claros.',
    color: '#06b6d4',
    bg: '#e0f7fb',
  },
];

const FAQS = [
  { q: '¿Necesito instalar algo?', a: 'No. Funciona desde el navegador en cualquier compu, tablet o celular. Solo entrás con tu usuario.' },
  { q: '¿Puede usarlo más de una persona a la vez?', a: 'Sí. Creás un usuario por persona y todos pueden trabajar al mismo tiempo desde distintos dispositivos.' },
  { q: 'Si cambio un precio, ¿se actualiza lo que me deben?', a: 'Exacto. Los fiados se calculan al precio del día, así que si subiste el precio de un artículo, la deuda del cliente queda al valor actualizado.' },
  { q: '¿Cómo es la prueba gratis?', a: 'Creás tu usuario y tenés 3 días para usar todo sin límites. Si te sirve, continuás con el plan mensual.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', color: '#1a1c1a', background: '#fbf8f1', lineHeight: 1.55, overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(251,248,241,.88)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e7e0d2' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(18px,4vw,40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 19 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0d9f6e,#12c98a)', display: 'grid', placeItems: 'center', color: '#053b2b', fontWeight: 900, fontSize: 19, boxShadow: '0 6px 14px rgba(13,159,110,.35)' }}>A</span>
            Almacén
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="#funciones" style={{ fontSize: 14, fontWeight: 600, color: '#5d6b5f', textDecoration: 'none' }}>Funciones</a>
            <a href="#precio" style={{ fontSize: 14, fontWeight: 600, color: '#5d6b5f', textDecoration: 'none' }}>Precio</a>
            <a href="#faq" style={{ fontSize: 14, fontWeight: 600, color: '#5d6b5f', textDecoration: 'none' }}>Preguntas</a>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: '#5d6b5f', textDecoration: 'none' }}>Entrar</Link>
            <Link href="/register" style={{ background: PRIMARY, color: '#fff', borderRadius: 12, padding: '10px 18px', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 20px rgba(13,159,110,.28)' }}>
              Probar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: 'clamp(50px,8vw,96px) clamp(18px,4vw,40px) clamp(40px,6vw,70px)', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 'clamp(30px,5vw,60px)', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e2f4ec', color: '#0a7e57', fontWeight: 700, fontSize: 13, padding: '7px 14px', borderRadius: 30, border: '1px solid #bfe8d6', marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: PRIMARY, boxShadow: '0 0 0 3px rgba(13,159,110,.25)' }} />
              Hecho para kioscos y almacenes de barrio
            </span>
            <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 700, fontSize: 'clamp(38px,6.2vw,68px)', lineHeight: 1.02, letterSpacing: '-.02em', margin: '0 0 18px' }}>
              Tu kiosco, <em style={{ fontStyle: 'italic', color: PRIMARY }}>ordenado</em> y bajo control.
            </h1>
            <p style={{ fontSize: 'clamp(16px,2.2vw,19px)', color: '#5d6b5f', maxWidth: 520, marginBottom: 28 }}>
              Cargá tus productos, cobrá en segundos con ticket y comprobante, llevá el stock, los fiados y los pagos a proveedores. Todo desde la compu o el celular.
            </p>
            <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/register" style={{ background: PRIMARY, color: '#fff', borderRadius: 14, padding: '15px 28px', fontSize: 16.5, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 20px rgba(13,159,110,.28)' }}>
                Probar gratis 3 días
              </Link>
              <Link href="/login" style={{ background: '#fff', color: '#1a1c1a', borderRadius: 14, padding: '15px 28px', fontSize: 16.5, fontWeight: 700, border: '1.5px solid #e7e0d2', textDecoration: 'none' }}>
                Iniciar sesión →
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 26, color: '#5d6b5f', fontSize: 13.5, fontWeight: 600 }}>
              {['Sin instalar nada', 'Funciona en el celular', '3 días gratis'].map((t) => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Check size={16} style={{ stroke: PRIMARY }} /> {t}
                </span>
              ))}
            </div>
          </div>
          {/* Mock */}
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 30px 70px rgba(26,28,26,.16)', border: '1px solid #e7e0d2', overflow: 'hidden', transform: 'rotate(.6deg)' }}>
            <div style={{ height: 38, background: '#11161d', display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px' }}>
              {['#ff5f57','#febc2e','#28c840'].map((c) => <i key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, display: 'block' }} />)}
              <span style={{ marginLeft: 10, color: '#8a93a3', fontSize: 11, fontFamily: 'monospace' }}>almacén · punto de venta</span>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: 54, background: '#11161d', padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
                {[true,false,false,false,false].map((on, i) => <i key={i} style={{ width: 24, height: 24, borderRadius: 7, background: on ? PRIMARY : 'rgba(255,255,255,.08)', display: 'block' }} />)}
              </div>
              <div style={{ flex: 1, padding: 16, background: '#f3f5f8' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {[{l:'Facturado',v:'$84.300',c:'#1a1c1a'},{l:'Ganancia',v:'$25.100',c:PRIMARY},{l:'Por cobrar',v:'$4.745',c:ACCENT}].map((k) => (
                    <div key={k.l} style={{ flex: 1, background: '#fff', border: '1px solid #e6eaf0', borderRadius: 10, padding: 9 }}>
                      <b style={{ fontSize: 9, color: '#8a93a3', textTransform: 'uppercase', letterSpacing: '.04em' }}>{k.l}</b>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 15, marginTop: 2, color: k.c }}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[['Galletitas','Surtidas','$2.465'],['Bebidas','Gaseosa 2,25L','$3.780'],['Alimentos','Leche 1L','$1.250']].map(([r,n,p]) => (
                    <div key={n} style={{ background: '#fff', border: '1px solid #e6eaf0', borderRadius: 9, padding: 9 }}>
                      <span style={{ fontSize: 8, color: '#0a7e57', background: '#e2f4ec', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>{r}</span>
                      <div style={{ fontSize: 11, fontWeight: 700, margin: '6px 0 3px' }}>{n}</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>{p}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funciones" style={{ padding: 'clamp(48px,7vw,84px) clamp(18px,4vw,40px)', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto clamp(34px,5vw,52px)' }}>
          <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase', color: ACCENT }}>Todo en un solo lugar</span>
          <h2 style={{ fontFamily: 'var(--font-fraunces),Georgia,serif', fontWeight: 700, fontSize: 'clamp(28px,4.2vw,44px)', lineHeight: 1.08, letterSpacing: '-.02em', margin: '12px 0 14px' }}>Lo que podés hacer</h2>
          <p style={{ fontSize: 'clamp(15px,2vw,17.5px)', color: '#5d6b5f' }}>Pensado para el día a día del mostrador: rápido para cobrar y completo para que no se te escape ningún número.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} style={{ background: '#fff', border: '1px solid #e7e0d2', borderRadius: 18, padding: 26, transition: '.18s' }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: 'grid', placeItems: 'center', marginBottom: 16 }}>
                <Icon size={25} style={{ stroke: color, fill: 'none' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, letterSpacing: '-.01em' }}>{title}</h3>
              <p style={{ fontSize: 14.5, color: '#5d6b5f' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MULTIUSER BAND */}
      <section id="multiusuario" style={{ padding: '0 clamp(18px,4vw,40px) clamp(48px,7vw,84px)', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg,#0e1a16,#10261d)', color: '#fff', borderRadius: 26, padding: 'clamp(34px,5vw,58px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 40, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-fraunces),Georgia,serif', fontWeight: 700, fontSize: 'clamp(26px,3.6vw,40px)', lineHeight: 1.1, marginBottom: 16 }}>Varios usuarios, al mismo tiempo</h2>
              <p style={{ color: '#bfd3c9', fontSize: 16, maxWidth: 440 }}>Vos en el mostrador, tu empleado en la otra caja y vos mirando los números desde casa. Todos conectados a la vez.</p>
              <ul style={{ listStyle: 'none', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Creás un usuario para cada persona del local','Acceso simultáneo desde varias cajas o dispositivos','Cada uno entra con su propio usuario y contraseña','Se ve igual de bien en compu, tablet y celular'].map((item) => (
                  <li key={item} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: 15, color: '#e7efe9' }}>
                    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 7, background: PRIMARY, display: 'grid', placeItems: 'center' }}>
                      <Check size={13} style={{ stroke: '#fff' }} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 18, padding: 22 }}>
              <div style={{ fontSize: 12, color: '#9fb3a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Conectados ahora</div>
              {[['M','#0d9f6e','Mostrador 1','Caja principal'],['C','#f0653e','Caja 2','Empleado'],['D','#7c5cff','Dueño','Desde el celular']].map(([initial, color, name, role]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  <span style={{ width: 38, height: 38, borderRadius: '50%', background: color, display: 'grid', placeItems: 'center', fontWeight: 800, color: '#fff', fontSize: 15 }}>{initial}</span>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 14.5 }}>{name}</b>
                    <small style={{ display: 'block', color: '#9fb3a8', fontSize: 12 }}>{role}</small>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#28c840', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28c840', display: 'block' }} /> En línea
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precio" style={{ padding: '0 clamp(18px,4vw,40px) clamp(48px,7vw,84px)', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
          <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase', color: ACCENT }}>Precio simple</span>
          <h2 style={{ fontFamily: 'var(--font-fraunces),Georgia,serif', fontWeight: 700, fontSize: 'clamp(28px,4.2vw,44px)', lineHeight: 1.08, margin: '12px 0 14px' }}>Un solo plan, todo incluido</h2>
          <p style={{ fontSize: 'clamp(15px,2vw,17.5px)', color: '#5d6b5f' }}>Sin letra chica. Probás 3 días gratis y si te sirve, seguís.</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fff', border: '1px solid #e7e0d2', borderRadius: 24, boxShadow: '0 30px 70px rgba(26,28,26,.16)', maxWidth: 430, width: '100%', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg,#0d9f6e,#12c98a)', padding: '30px 32px 26px', color: '#fff' }}>
              <span style={{ display: 'inline-block', background: 'rgba(255,255,255,.2)', fontWeight: 700, fontSize: 12.5, padding: '5px 13px', borderRadius: 20, marginBottom: 14 }}>PLAN COMPLETO</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 24, fontWeight: 700 }}>$</span>
                <span style={{ fontFamily: 'var(--font-fraunces),Georgia,serif', fontWeight: 900, fontSize: 'clamp(46px,7vw,62px)', lineHeight: 1 }}>30.000</span>
                <span style={{ fontSize: 16, opacity: .9, fontWeight: 600 }}>/ mes</span>
              </div>
              <div style={{ marginTop: 6, opacity: .92, fontSize: 14 }}>Todas las funciones · usuarios ilimitados</div>
            </div>
            <div style={{ padding: '26px 32px 30px' }}>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 24 }}>
                {['Punto de venta con ticket y comprobante','Inventario, control de stock y precios','Clientes, fiados y cuenta corriente','Proveedores con varios medios de pago','Reportes, gráficos y respaldos','Multiusuario con acceso simultáneo'].map((feat) => (
                  <li key={feat} style={{ display: 'flex', gap: 11, fontSize: 14.5, fontWeight: 500 }}>
                    <span style={{ flexShrink: 0, width: 21, height: 21, borderRadius: '50%', background: '#e2f4ec', display: 'grid', placeItems: 'center' }}>
                      <Check size={12} style={{ stroke: '#0a7e57' }} />
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{ display: 'block', width: '100%', background: PRIMARY, color: '#fff', borderRadius: 11, padding: '15px', fontWeight: 800, fontSize: 15, textAlign: 'center', textDecoration: 'none', boxShadow: '0 8px 20px rgba(13,159,110,.28)' }}>
                Empezar prueba gratis
              </Link>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#5d6b5f', marginTop: 14 }}>3 días gratis · no pedimos tarjeta para probar</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '0 clamp(18px,4vw,40px) clamp(48px,7vw,84px)', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
          <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase', color: ACCENT }}>Dudas</span>
          <h2 style={{ fontFamily: 'var(--font-fraunces),Georgia,serif', fontWeight: 700, fontSize: 'clamp(28px,4.2vw,44px)', lineHeight: 1.08, margin: '12px 0 0' }}>Preguntas frecuentes</h2>
        </div>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e7e0d2', borderRadius: 14, overflow: 'hidden' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '18px 22px', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}
              >
                {faq.q}
                <ChevronDown size={20} style={{ color: PRIMARY, transition: '.2s', transform: openFaq === i ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
              </button>
              {openFaq === i && (
                <p style={{ padding: '0 22px 20px', color: '#5d6b5f', fontSize: 14.5 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 clamp(18px,4vw,40px) clamp(48px,7vw,84px)', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', background: '#f4eee1', borderRadius: 26, padding: 'clamp(40px,6vw,70px) clamp(20px,4vw,40px)' }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces),Georgia,serif', fontWeight: 700, fontSize: 'clamp(28px,4.5vw,46px)', lineHeight: 1.05, marginBottom: 14 }}>Empezá a ordenar tu kiosco hoy</h2>
          <p style={{ color: '#5d6b5f', fontSize: 17, maxWidth: 480, margin: '0 auto 26px' }}>Probalo 3 días gratis. En cinco minutos ya estás cobrando con el ticket y viendo tu ganancia.</p>
          <div style={{ display: 'flex', gap: 13, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: PRIMARY, color: '#fff', borderRadius: 14, padding: '15px 28px', fontSize: 16.5, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 20px rgba(13,159,110,.28)' }}>
              Crear mi usuario gratis
            </Link>
            <Link href="/login" style={{ background: '#fff', color: '#1a1c1a', borderRadius: 14, padding: '15px 28px', fontSize: 16.5, fontWeight: 700, border: '1.5px solid #e7e0d2', textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #e7e0d2', padding: '36px clamp(18px,4vw,40px)', marginTop: 40 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, color: '#5d6b5f', fontSize: 13.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 17 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#0d9f6e,#12c98a)', display: 'grid', placeItems: 'center', color: '#053b2b', fontWeight: 900, fontSize: 16 }}>A</span>
            Almacén
          </div>
          <div>Sistema de gestión para kioscos y almacenes · Hecho en Argentina 🇦🇷</div>
        </div>
      </footer>
    </div>
  );
}
