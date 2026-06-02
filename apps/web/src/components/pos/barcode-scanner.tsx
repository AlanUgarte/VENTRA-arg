'use client';
import { useEffect, useRef, useState } from 'react';
import { ScanLine, Keyboard, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

// ID fijo del contenedor — debe estar en el DOM antes de inicializar el scanner
const CONTAINER_ID = 'html5-qrcode-container';

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [phase, setPhase] = useState<'loading' | 'scanning' | 'error'>('loading');
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const scannedRef = useRef(false);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      try { scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  const handleFound = async (code: string) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    if ('vibrate' in navigator) navigator.vibrate(100);
    await stopScanner();
    onScan(code.trim());
  };

  // El div DEBE estar montado antes de inicializar el scanner
  // Por eso usamos useEffect (corre después del primer render)
  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      // Pequeño delay para asegurar que el DOM está listo
      await new Promise(r => setTimeout(r, 100));
      if (!mountedRef.current) return;

      try {
        const { Html5Qrcode } = await import('html5-qrcode');

        const scanner = new Html5Qrcode(CONTAINER_ID);
        scannerRef.current = scanner;

        if (!mountedRef.current) return;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 100 },
            aspectRatio: 1.5,
          },
          (decodedText: string) => {
            if (!scannedRef.current) handleFound(decodedText);
          },
          undefined, // error callback — silenciar los errores de frame
        );

        if (mountedRef.current) setPhase('scanning');

      } catch (err: any) {
        if (!mountedRef.current) return;
        const msg = err?.message ?? '';
        if (msg.includes('Permission') || msg.includes('Denied') || msg.includes('NotAllowed')) {
          // Permiso denegado
        }
        setPhase('error');
        setShowManual(true);
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (code) { stopScanner(); onScan(code); }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/80" onClick={handleClose} />

      {/* Sheet bottom en mobile, centrado en desktop */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-black rounded-t-3xl overflow-hidden md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] md:rounded-3xl"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-white/20 md:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2 text-white">
            <ScanLine className="h-5 w-5 text-green-400" />
            <span className="font-bold">Escanear código de barras</span>
          </div>
          <button
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white text-xl font-bold hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Contenedor del scanner — SIEMPRE en el DOM */}
        <div className="relative">
          {/* Loading overlay */}
          {phase === 'loading' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black" style={{ minHeight: 220 }}>
              <Loader2 className="h-10 w-10 text-green-400 animate-spin" />
              <p className="text-white text-sm">Abriendo cámara…</p>
              <p className="text-gray-400 text-xs">Aceptá el permiso de cámara si aparece</p>
            </div>
          )}

          {/* Error overlay */}
          {phase === 'error' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black p-6" style={{ minHeight: 220 }}>
              <p className="text-white text-sm text-center">No se pudo acceder a la cámara.</p>
              <p className="text-gray-400 text-xs text-center mt-1">
                Verificá en Ajustes del celular que el navegador tenga permiso de cámara.
              </p>
            </div>
          )}

          {/* Visor animado (visible solo al escanear) */}
          {phase === 'scanning' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-24">
                <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                <div className="absolute inset-x-4 h-0.5 bg-green-400" style={{ animation: 'scanline 1.8s ease-in-out infinite', top: '50%' }} />
              </div>
            </div>
          )}

          {/* El div que html5-qrcode controla — SIEMPRE montado */}
          <div
            id={CONTAINER_ID}
            className="w-full"
            style={{ minHeight: 220, background: '#000' }}
          />
        </div>

        {/* Instrucción */}
        {phase === 'scanning' && (
          <p className="text-center text-green-400 text-xs py-2 bg-black px-4">
            Apuntá el código al rectángulo verde • iPhone, Android y más
          </p>
        )}

        {/* Panel inferior */}
        <div className="bg-white px-5 py-4 space-y-3">
          {showManual && (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                placeholder="Escribí el código manualmente…"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" className="rounded-xl bg-green-600 px-4 text-sm font-bold text-white hover:bg-green-700">
                Buscar
              </button>
            </form>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowManual(!showManual)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Keyboard className="h-4 w-4" />
              {showManual ? 'Ocultar manual' : 'Ingresar código'}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 rounded-2xl bg-gray-100 py-3 text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
          <p className="text-center text-xs text-gray-400">
            Compatible con iPhone, Android y computadoras · EAN-13, EAN-8, Code128, QR
          </p>
        </div>

        <style>{`
          @keyframes scanline {
            0%, 100% { top: 15%; opacity: 1; }
            50% { top: 85%; opacity: 0.7; }
          }
        `}</style>
      </div>
    </>
  );
}
