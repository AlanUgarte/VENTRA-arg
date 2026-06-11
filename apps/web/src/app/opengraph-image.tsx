import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0e1a16 0%, #10261d 50%, #0b1f18 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '36px' }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              background: 'linear-gradient(135deg, #0d9f6e, #12c98a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              fontWeight: 900,
              color: '#053b2b',
            }}
          >
            A
          </div>
          <span style={{ fontSize: 60, fontWeight: 900, color: '#ffffff', letterSpacing: '-2px' }}>
            VENTRA ARG
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 30,
            color: '#bfd3c9',
            textAlign: 'center',
            maxWidth: 820,
            lineHeight: 1.4,
            marginBottom: '44px',
          }}
        >
          Sistema de gestión para kioscos y almacenes
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '44px' }}>
          {['Punto de venta', 'Inventario', 'Fiados', 'Proveedores', 'Reportes'].map((f) => (
            <div
              key={f}
              style={{
                background: 'rgba(13,159,110,.25)',
                border: '1px solid rgba(13,159,110,.5)',
                color: '#7fe8c0',
                padding: '8px 20px',
                borderRadius: 32,
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* CTA badge */}
        <div
          style={{
            background: '#0d9f6e',
            color: '#ffffff',
            padding: '16px 40px',
            borderRadius: 48,
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '-0.5px',
          }}
        >
          7 días gratis · $24.990/mes · Todo incluido
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
