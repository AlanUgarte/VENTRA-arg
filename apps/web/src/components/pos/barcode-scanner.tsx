'use client';
import { useEffect, useRef, useState } from 'react';
import { ScanLine, Keyboard, Loader2, CheckCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;   // llamado por cada escaneo — NO cierra el scanner
  onClose: () => void;              // cierra cuando el usuario lo decide
}

const CONTAINER_ID = 'html5-qrcode-container';

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [phase, setPhase] = useState<'loading' | 'scanning' | 'error'>('loading');
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [lastScanned, setLastScanned] = useState('');  // muestra brevemente qué se escaneó
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const cooldownRef = useRef(false);  // evita doble escaneo del mismo código

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

  const handleFound = (code: string) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;

    if ('vibrate' in navigator) navigator.vibrate(80);
    const trimmed = code.trim();
    setLastScanned(trimmed);
    onScan(trimmed);  // agrega al carrito — el scanner SIGUE ABIERTO

    // Cooldown de 2s para no escanear el mismo artículo dos veces por error
    setTimeout(() => {
      if (mountedRef.current) {
        cooldownRef.current = false;
        setLastScanned('');
      }
    }, 2000);
  };

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      await new Promise(r => setTimeout(r, 100));
      if (!mountedRef.current) return;

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode(CONTAINER_ID);
        scannerRef.current = scanner;
        if (!mountedRef.current) return;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 100 }, aspectRatio: 1.5 },
          (decodedText: string) => { handleFound(decodedText); },
          undefined,
        );

        if (mountedRef.current) setPhase('scanning');
      } catch {
        if (!mountedRef.current) return;
        setPhase('error');
        setShowManual(true);
      }
    };

    init();
    return () => { mountedRef.current = false; stopScanner(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    if ('vibrate' in navigator) navigator.vibrate(80);
    setLastScanned(code);
    setManualCode('');
    onScan(code);  // también queda abierto en modo manual
    setTimeout(() => { if (mountedRef.current) setLastScanned(''); }, 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80" onClick={handleClose} />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-black rounded-t-3xl overflow-hidden md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] md:rounded-3xl"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-white/20 md:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2 text-white">
            <ScanLine className="h-5 w-5 text-green-400" />
            <div>
              <p className="font-bold text-sm">Escanear código de barras</p>
              <p className="text-[11px] text-green-300">Escaneá varios artículos seguidos</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white text-xl font-bold hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Área de cámara */}
        <div className="relative">
          {phase === 'loading' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black" style={{ minHeight: 220 }}>
              <Loader2 className="h-10 w-10 text-green-400 animate-spin" />
              <p className="text-white text-sm">Abriendo cámara…</p>
              <p className="text-gray-400 text-xs">Aceptá el permiso si aparece</p>
            </div>
          )}

          {phase === 'error' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black p-6" style={{ minHeight: 220 }}>
              <p className="text-white text-sm text-center">No se pudo acceder a la cámara.</p>
              <p className="text-gray-400 text-xs text-center">Ingresá los códigos manualmente abajo.</p>
            </div>
          )}

          {/* Visor verde animado */}
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

          {/* Feedback de artículo escaneado */}
          {lastScanned && (
            <div className="absolute top-3 inset-x-4 z-20 flex items-center gap-2 rounded-2xl bg-green-500 px-4 py-2.5 shadow-lg">
              <CheckCircle className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white text-sm font-bold truncate">¡Artículo agregado al ticket!</span>
            </div>
          )}

          {/* Contenedor html5-qrcode — SIEMPRE en el DOM */}
          <div id={CONTAINER_ID} className="w-full" style={{ minHeight: 220, background: '#000' }} />
        </div>

        {/* Instrucción */}
        {phase === 'scanning' && !lastScanned && (
          <p className="text-center text-green-400 text-xs py-2 bg-black">
            Apuntá al código de barras • El escáner queda abierto para seguir cargando
          </p>
        )}
        {phase === 'scanning' && lastScanned && (
          <p className="text-center text-green-300 text-xs py-2 bg-black font-semibold">
            ✓ Escaneado — seguí apuntando al próximo artículo
          </p>
        )}

        {/* Panel inferior */}
        <div className="bg-white px-5 py-4 space-y-3">
          {showManual && (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Código de barras…"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" className="rounded-xl bg-green-600 px-4 text-sm font-bold text-white hover:bg-green-700">
                + Agregar
              </button>
            </form>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowManual(!showManual)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-semibold hover:bg-gray-50"
            >
              <Keyboard className="h-4 w-4" />
              {showManual ? 'Ocultar manual' : 'Código manual'}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 rounded-2xl bg-red-50 border border-red-200 py-3 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
              Cerrar escáner
            </button>
          </div>
        </div>

        <style>{`
          @keyframes scanline {
            0%, 100% { top: 15%; } 50% { top: 85%; }
          }
        `}</style>
      </div>
    </>
  );
}
