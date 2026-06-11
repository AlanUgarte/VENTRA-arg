import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #0d9f6e, #12c98a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 100,
          fontWeight: 900,
          color: '#053b2b',
          fontFamily: 'sans-serif',
        }}
      >
        A
      </div>
    ),
    { width: 180, height: 180 },
  );
}
