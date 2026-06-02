'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Building2, CreditCard, TrendingUp,
  Activity, LogOut, Shield, Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const NAV = [
  { href: '/admin',          label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { href: '/admin/tenants',  label: 'Negocios',   icon: Building2 },
  { href: '/admin/plans',    label: 'Planes',     icon: CreditCard },
  { href: '/admin/revenue',  label: 'Revenue',    icon: TrendingUp },
  { href: '/admin/activity', label: 'Actividad',  icon: Activity },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout(); router.push('/login');
  };

  return (
    <aside className="flex h-full w-60 flex-col bg-slate-950 text-white border-r border-white/10">
      <div className="flex items-center justify-between gap-2.5 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-500/30">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">VENTRA ARG</p>
            <p className="mt-0.5 text-[10px] text-white/40">Super Admin</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={onClose}
              className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors',
                active ? 'bg-violet-600 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white')}>
              <Icon className="h-4 w-4 flex-shrink-0" /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-1">
        {user && (
          <div className="rounded-xl bg-white/5 px-3 py-2">
            <p className="text-xs font-semibold truncate">{user.name}</p>
            <p className="text-[10px] text-white/40 truncate">{user.email}</p>
          </div>
        )}
        <button onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/40 hover:bg-red-500/10 hover:text-red-300 transition-colors">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuthStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!accessToken) { router.replace('/login'); return null; }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
        {/* Mobile topbar */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-slate-950 px-4 py-3 md:hidden">
          <button onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-bold text-white">Super Admin</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
