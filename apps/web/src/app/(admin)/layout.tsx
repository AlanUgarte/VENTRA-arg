'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import {
  LayoutDashboard, Building2, CreditCard, TrendingUp,
  Activity, LogOut, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/tenants', label: 'Negocios', icon: Building2 },
  { href: '/admin/plans', label: 'Planes', icon: CreditCard },
  { href: '/admin/revenue', label: 'Revenue', icon: TrendingUp },
  { href: '/admin/activity', label: 'Actividad', icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, accessToken, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!accessToken) { router.replace('/login'); return; }
    // Will be validated server-side; client check for UX
  }, [accessToken, router]);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    router.push('/login');
  };

  if (!accessToken) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="flex w-60 flex-shrink-0 flex-col border-r border-white/10">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-500/30">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">VENTRA ARG</p>
            <p className="mt-0.5 text-[10px] text-white/40">Super Admin</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                    : 'text-white/50 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3 space-y-1">
          {user && (
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <p className="text-xs font-semibold">{user.name}</p>
              <p className="text-[10px] text-white/40">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/40 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto bg-slate-900">
        {children}
      </main>
    </div>
  );
}
