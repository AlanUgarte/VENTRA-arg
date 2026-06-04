import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad — VENTRA ARG',
};

export default function PrivacyPage() {
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
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, marginBottom: 8 }}>Política de Privacidad</h1>
        <p style={{ color: '#5d6b5f', marginBottom: 40 }}>Última actualización: junio 2026</p>

        {[
          { title: '1. Información que recopilamos', body: 'Recopilamos información que nos proporcionás al crear una cuenta: nombre, email, nombre del negocio y contraseña. También registramos datos de uso del sistema como ventas, productos, clientes y proveedores que vos ingresás.' },
          { title: '2. Cómo usamos tu información', body: 'Usamos tu información exclusivamente para prestarte el servicio de VENTRA ARG: gestión de tu punto de venta, inventario, reportes y facturación. No vendemos ni compartimos tu información con terceros, salvo lo necesario para procesar pagos (Mercado Pago) y enviar emails transaccionales.' },
          { title: '3. Almacenamiento y seguridad', body: 'Tus datos se almacenan en servidores seguros con cifrado en tránsito (HTTPS/TLS). Las contraseñas se almacenan cifradas con bcrypt. Tomamos medidas razonables para proteger tu información.' },
          { title: '4. Datos de terceros — Mercado Pago', body: 'El procesamiento de pagos se realiza a través de Mercado Pago. Al suscribirte, los datos de pago son manejados directamente por Mercado Pago de acuerdo a sus políticas de privacidad. VENTRA ARG no almacena datos de tarjetas de crédito.' },
          { title: '5. Tus derechos', body: 'Podés acceder, corregir o eliminar tu información en cualquier momento. Para solicitar la eliminación de tu cuenta y datos, contactanos en: ugartemultiproductos@gmail.com.' },
          { title: '6. Retención de datos', body: 'Mantenemos tus datos mientras tu cuenta esté activa. Si cancelás tu suscripción, conservamos los datos por 30 días antes de eliminarlos, para permitirte recuperar información si necesitás reactivar.' },
          { title: '7. Cookies', body: 'Usamos cookies de sesión para mantenerte autenticado. No usamos cookies de seguimiento ni publicidad.' },
          { title: '8. Cambios en esta política', body: 'Te notificaremos por email si hacemos cambios significativos en esta política.' },
          { title: '9. Contacto', body: 'Para preguntas sobre privacidad: ugartemultiproductos@gmail.com' },
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
        <Link href="/terms" style={{ color: '#5d6b5f', textDecoration: 'none' }}>Términos de uso</Link>
      </footer>
    </div>
  );
}
