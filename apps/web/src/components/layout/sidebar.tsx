'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingCart, Package, Users, Truck,
  BarChart3, Settings, LogOut, CreditCard, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import api from '@/lib/api';

const NAV = [
  { href: '/pos',       label: 'Punto de venta',   icon: ShoppingCart, roles: ['OWNER','ADMIN','CASHIER'] },
  { href: '/inventory', label: 'Inventario',        icon: Package,      roles: ['OWNER','ADMIN','CASHIER'] },
  { href: '/customers', label: 'Clientes / Fiados', icon: Users,        roles: ['OWNER','ADMIN','CASHIER'] },
  { href: '/suppliers', label: 'Proveedores',       icon: Truck,        roles: ['OWNER','ADMIN','CASHIER'] },
  { href: '/returns',   label: 'Devoluciones',      icon: Package,      roles: ['OWNER','ADMIN'] },
  { href: '/reports',   label: 'Reportes',          icon: BarChart3,    roles: ['OWNER','ADMIN'] },
  { href: '/users',     label: 'Usuarios',          icon: Users,        roles: ['OWNER','ADMIN'] },
  { href: '/billing',   label: 'Suscripción',       icon: CreditCard,   roles: ['OWNER'] },
  { href: '/settings',  label: 'Configuración',     icon: Settings,     roles: ['OWNER','ADMIN'] },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    router.push('/login');
  };

  const filteredNav = NAV.filter(({ roles }) => !user?.role || roles.includes(user.role));

  return (
    <aside className="flex h-full w-[236px] flex-shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-lg font-black text-emerald-900 shadow-lg shadow-primary/30">
            A
          </div>
          <div>
            <p className="text-sm font-extrabold text-white leading-none">Almacén</p>
            <p className="mt-0.5 text-[11px] text-white/50 leading-none truncate max-w-[120px]">
              {user?.tenant?.name ?? 'Gestión'}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {filteredNav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors',
                active
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-1">
        {user && (
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary flex-shrink-0">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="text-[10px] text-white/40">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-white/50 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export function Sidebar() {
  const { sidebarOpen, closeSidebar } = useUiStore();

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={closeSidebar}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <SidebarContent onClose={closeSidebar} />
          </div>
        </>
      )}
    </>
  );
}
