'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Package, ShoppingCart, Users, ChevronRight, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'ventra-onboarded';

const STEPS = [
  {
    icon: Package,
    color: '#0d9f6e',
    bg: '#e2f4ec',
    title: 'Cargá tus productos',
    desc: 'Andá a Inventario y creá los rubros y artículos de tu kiosco. Podés escanear el código de barras con el celular para cargarlos más rápido.',
    action: '/inventory',
    actionLabel: 'Ir a Inventario →',
  },
  {
    icon: ShoppingCart,
    color: '#f0653e',
    bg: '#fdeae3',
    title: 'Hacé tu primera venta',
    desc: 'En el Punto de Venta buscás o escaneás los productos, aplicás descuentos si querés y cerrás la venta. Se genera un comprobante para compartir por WhatsApp.',
    action: '/pos',
    actionLabel: 'Ir al POS →',
  },
  {
    icon: Users,
    color: '#7c5cff',
    bg: '#efeaff',
    title: 'Llevá los fiados',
    desc: 'En Clientes podés anotar quién te debe y cuánto. Los precios se actualizan solos cuando los modificás en inventario.',
    action: '/customers',
    actionLabel: 'Ir a Clientes →',
  },
];

export function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  }

  function goTo(path: string) {
    dismiss();
    router.push(path);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,15,12,.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#fff' }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-5 flex items-start justify-between"
          style={{ background: 'linear-gradient(135deg, #0d9f6e, #12c98a)' }}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} style={{ stroke: 'rgba(255,255,255,.8)' }} />
            <span className="text-sm font-bold text-white/80">Primeros pasos</span>
          </div>
          <button
            onClick={dismiss}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,.15)' }}
          >
            <X size={14} style={{ stroke: '#fff' }} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 px-6 pt-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? '#0d9f6e' : '#e7e0d2' }}
            />
          ))}
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: current.bg }}
          >
            <Icon size={28} style={{ stroke: current.color }} />
          </div>

          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: current.color }}>
            Paso {step + 1} de {STEPS.length}
          </p>
          <h2 className="text-xl font-extrabold mb-3">{current.title}</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#5d6b5f' }}>
            {current.desc}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => goTo(current.action)}
              className="flex-1 rounded-xl py-3 text-center text-sm font-bold text-white"
              style={{ background: current.color }}
            >
              {current.actionLabel}
            </button>
            <button
              onClick={next}
              className="flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold"
              style={{ background: '#f3f5f8', color: '#5d6b5f' }}
            >
              {step < STEPS.length - 1 ? (
                <>Siguiente <ChevronRight size={14} /></>
              ) : (
                '¡Listo!'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
