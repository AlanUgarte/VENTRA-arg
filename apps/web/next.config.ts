import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  webpack(config, { isServer, webpack }) {
    if (isServer) {
      // Some dependencies access `location` (a browser global) at module init
      // time. Node.js doesn't define globalThis.location, causing ReferenceError
      // during Next.js static page generation.
      config.plugins.push(
        new webpack.BannerPlugin({
          banner:
            'if(typeof globalThis.location==="undefined"){globalThis.location={href:"",pathname:"/",search:"",hash:"",assign:function(){},replace:function(){},reload:function(){}}}',
          raw: true,
          entryOnly: false,
        }),
      );
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
