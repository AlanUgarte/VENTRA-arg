import Link from 'next/link';

export const metadata = {
  title: 'Términos de Uso — VENTRA ARG',
};

export default function TermsPage() {
  return (
    <div style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', background: '#fbf8f1', color: '#1a1c1a', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid #e7e0d2', padding: '0 clamp(18px,4vw,40px)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', height: 64, gap: 10 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#1a1c1a', fontWeight: 800, fontSize: 18 }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#0d9f6e,#12c98a)', display: 'grid', placeItems: 'center', color: '#053b2b', fontWeight: 900, fontSize: 17 }}>A</span>
            VENTRA ARG
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(32px,5vw,64px) clamp(18px,4vw,40px)' }}>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, marginBottom: 8 }}>Términos de Uso</h1>
        <p style={{ color: '#5d6b5f', marginBottom: 40 }}>Última actualización: junio 2026</p>

        {[
          { title: '1. Aceptación de los términos', body: 'Al crear una cuenta en VENTRA ARG, aceptás estos Términos de Uso. Si no estás de acuerdo, no uses el servicio.' },
          { title: '2. Descripción del servicio', body: 'VENTRA ARG es un sistema de gestión para kioscos y almacenes que incluye punto de venta, inventario, clientes, proveedores y reportes. El servicio se ofrece bajo un modelo de suscripción mensual.' },
          { title: '3. Período de prueba', body: 'Ofrecemos 7 días de prueba gratuita sin necesidad de tarjeta de crédito. Al finalizar el período de prueba, el acceso se suspende hasta que elijas un plan.' },
          { title: '4. Suscripción y pagos', body: 'Los planes disponibles son Plan Básico ($15.000/mes) y Plan Profesional ($30.000/mes). Los pagos se procesan mensualmente a través de Mercado Pago. Podés cancelar en cualquier momento; el acceso se mantiene hasta el fin del período pagado.' },
          { title: '5. Uso aceptable', body: 'No podés usar VENTRA ARG para actividades ilegales, fraudulentas o que violen derechos de terceros. El sistema está diseñado para uso comercial legítimo en Argentina.' },
          { title: '6. Propiedad de los datos', body: 'Los datos que ingresás (productos, clientes, ventas) son de tu propiedad. VENTRA ARG no tiene derechos sobre tu información comercial.' },
          { title: '7. Disponibilidad del servicio', body: 'Nos esforzamos por mantener el servicio disponible 24/7, pero no garantizamos disponibilidad ininterrumpida. Podemos realizar mantenimientos programados.' },
          { title: '8. Limitación de responsabilidad', body: 'VENTRA ARG no se hace responsable por pérdidas de datos, interrupciones del servicio o decisiones comerciales basadas en la información del sistema. El servicio se provee "tal como está".' },
          { title: '9. Cancelación y terminación', body: 'Podés cancelar tu suscripción desde la sección Suscripción en el sistema. Nos reservamos el derecho de suspender cuentas que violen estos términos.' },
          { title: '10. Ley aplicable', body: 'Estos términos se rigen por las leyes de la República Argentina.' },
          { title: '11. Contacto', body: 'Para consultas: ugartemultiproductos@gmail.com' },
        ].map(({ title, body }) => (
          <section key={title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{title}</h2>
            <p style={{ color: '#5d6b5f', lineHeight: 1.7 }}>{body}</p>
          </section>
        ))}
      </main>

      <footer style={{ borderTop: '1px solid #e7e0d2', padding: '24px clamp(18px,4vw,40px)', textAlign: 'center', color: '#9aa3b0', fontSize: 13 }}>
        <Link href="/" style={{ color: '#0d9f6e', textDecoration: 'none', fontWeight: 600 }}>← Volver a VENTRA ARG</Link>
        {' · '}
        <Link href="/privacy" style={{ color: '#5d6b5f', textDecoration: 'none' }}>Política de privacidad</Link>
      </footer>
    </div>
  );
}
