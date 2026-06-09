// Polyfill globalThis.location for Node.js < 22 during SSR/static generation.
// Some dependencies access `location` directly (without `window.`) which is
// only available natively in Node 22+ (WinterCG compat). This ensures the
// build succeeds on older Node versions (e.g. Node 20 in CI/Docker).
export async function register() {
  if (typeof globalThis.location === 'undefined') {
    (globalThis as any).location = { href: '', pathname: '', search: '', hash: '' };
  }
}
