'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ScanLine, Keyboard, Loader2, CheckCircle, Zap, ZapOff, RefreshCw } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

// Formatos de código de barras comunes en productos de kiosco/almacén
const BARCODE_FORMATS = [
  'ean_13', 'ean_8', 'upc_a', 'upc_e',
  'code_128', 'code_39', 'code_93',
  'itf', 'codabar', 'data_matrix', 'qr_code',
];

const CONTAINER_ID = 'html5-qrcode-container';

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [phase, setPhase]           = useState<'loading' | 'scanning' | 'error'>('loading');
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const [torchOn, setTorchOn]       = useState(false);
  const [supportsTorch, setSupportsTorch] = useState(false);
  const [mode, setMode]             = useState<'native' | 'library' | null>(null);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number>(0);
  const mountedRef  = useRef(true);
  const cooldownRef = useRef(false);
  const detectorRef = useRef<any>(null);
  const html5Ref    = useRef<any>(null);

  const handleFound = useCallback((code: string) => {
    if (cooldownRef.current || !code.trim()) return;
    cooldownRef.current = true;
    const trimmed = code.trim();
    if ('vibrate' in navigator) navigator.vibrate([60, 30, 60]);
    setLastScanned(trimmed);
    onScan(trimmed);
    setTimeout(() => {
      if (mountedRef.current) { cooldownRef.current = false; setLastScanned(''); }
    }, 1500);
  }, [onScan]);

  // ── Modo 1: BarcodeDetector nativo (Chrome/Safari moderno) ──────────────────
  const startNative = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width:  { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
      });
      if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;

      // Detectar soporte de linterna
      const videoTrack = stream.getVideoTracks()[0];
      const caps = videoTrack.getCapabilities?.() as any;
      if (caps?.torch) setSupportsTorch(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({ formats: BARCODE_FORMATS });
      detectorRef.current = detector;

      setMode('native');
      setPhase('scanning');

      const scan = async () => {
        if (!mountedRef.current || !videoRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) handleFound(barcodes[0].rawValue);
        } catch {}
        rafRef.current = requestAnimationFrame(scan);
      };
      rafRef.current = requestAnimationFrame(scan);

    } catch {
      startLibrary();
    }
  }, [handleFound]);

  // ── Modo 2: html5-qrcode como fallback ─────────────────────────────────────
  const startLibrary = useCallback(async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (!mountedRef.current) return;

      const scanner = new Html5Qrcode(CONTAINER_ID);
      html5Ref.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 25,                                    // máximo FPS posible
          qrbox: { width: 320, height: 160 },        // área más grande
          aspectRatio: 2.0,                          // landscape para barcodes
          disableFlip: false,
          formatsToSupport: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], // todos los formatos
        },
        (code: string) => handleFound(code),
        undefined,
      );

      setMode('library');
      setPhase('scanning');
    } catch {
      if (mountedRef.current) { setPhase('error'); setShowManual(true); }
    }
  }, [handleFound]);

  // ── Linterna ────────────────────────────────────────────────────────────────
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(v => !v);
    } catch {}
  };

  // ── Reiniciar cámara ────────────────────────────────────────────────────────
  const restart = async () => {
    setPhase('loading');
    await stopAll();
    setTimeout(() => { if (mountedRef.current) init(); }, 300);
  };

  const stopAll = async () => {
    cancelAnimationFrame(rafRef.current);
    if (html5Ref.current) {
      try { await html5Ref.current.stop(); } catch {}
      try { html5Ref.current.clear(); } catch {}
      html5Ref.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const init = useCallback(async () => {
    const hasNative = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    if (hasNative) {
      await startNative();
    } else {
      await startLibrary();
    }
  }, [startNative, startLibrary]);

  const handleClose = async () => {
    await stopAll();
    onClose();
  };

  useEffect(() => {
    mountedRef.current = true;
    const t = setTimeout(() => { if (mountedRef.current) init(); }, 80);
    return () => {
      mountedRef.current = false;
      clearTimeout(t);
      stopAll();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    if ('vibrate' in navigator) navigator.vibrate(60);
    setLastScanned(code);
    setManualCode('');
    onScan(code);
    setTimeout(() => { if (mountedRef.current) setLastScanned(''); }, 1500);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm" onClick={handleClose} />

      {/* Panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden rounded-t-3xl bg-zinc-950 md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] md:rounded-3xl"
        style={{ maxHeight: '94vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-white/20 md:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/20">
              <ScanLine className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-none">Escáner de código</p>
              <p className="text-[11px] text-green-400 mt-0.5">
                {mode === 'native' ? '⚡ Modo rápido activo' : phase === 'scanning' ? '📷 Cámara activa' : 'Iniciando…'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {supportsTorch && phase === 'scanning' && (
              <button
                onClick={toggleTorch}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  torchOn ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Linterna"
              >
                {torchOn ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              </button>
            )}
            {phase === 'error' && (
              <button onClick={restart} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20">
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white text-lg font-bold hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Área de cámara */}
        <div className="relative bg-black" style={{ minHeight: 240 }}>

          {/* Loading */}
          {phase === 'loading' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 text-green-400 animate-spin" />
              <p className="text-white text-sm font-semibold">Iniciando cámara…</p>
              <p className="text-zinc-400 text-xs">Aceptá el permiso si aparece</p>
            </div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6">
              <p className="text-white text-sm text-center font-semibold">No se pudo acceder a la cámara</p>
              <p className="text-zinc-400 text-xs text-center">Verificá los permisos de cámara o ingresá el código manualmente</p>
              <button onClick={restart} className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700">
                <RefreshCw className="h-4 w-4" /> Reintentar
              </button>
            </div>
          )}

          {/* Visor — modo nativo */}
          {mode === 'native' && (
            <video
              ref={videoRef}
              className="w-full"
              style={{ minHeight: 240, objectFit: 'cover', display: phase === 'scanning' ? 'block' : 'none' }}
              playsInline
              muted
              autoPlay
            />
          )}

          {/* Visor — modo librería */}
          <div
            id={CONTAINER_ID}
            className="w-full"
            style={{ minHeight: mode === 'library' ? 240 : 0, display: mode === 'library' ? 'block' : 'none' }}
          />

          {/* Overlay de escaneo */}
          {phase === 'scanning' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              {/* Esquinas del visor */}
              <div className="relative w-72 h-32">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-green-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-green-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-green-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-green-400 rounded-br-lg" />
                {/* Línea de escaneo animada */}
                <div
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_8px_#4ade80]"
                  style={{ animation: 'scanline 1.4s ease-in-out infinite' }}
                />
              </div>
            </div>
          )}

          {/* Flash de éxito */}
          {lastScanned && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-green-500/20 pointer-events-none">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-green-500 px-6 py-3 shadow-2xl">
                <CheckCircle className="h-7 w-7 text-white" />
                <span className="text-white text-sm font-bold">¡Artículo agregado!</span>
              </div>
            </div>
          )}
        </div>

        {/* Instrucción */}
        <div className="bg-zinc-900 py-2 px-4 text-center border-t border-white/5">
          {phase === 'scanning' && !lastScanned && (
            <p className="text-green-400 text-xs">
              Apuntá el código de barras al recuadro verde · Queda abierto para seguir
            </p>
          )}
          {phase === 'scanning' && lastScanned && (
            <p className="text-green-300 text-xs font-semibold animate-pulse">
              ✓ Listo — apuntá al siguiente artículo
            </p>
          )}
        </div>

        {/* Panel inferior */}
        <div className="bg-white px-4 pt-3 pb-4 space-y-2.5">
          {showManual && (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Código de barras…"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                autoFocus
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" className="rounded-xl bg-green-600 px-4 text-sm font-bold text-white hover:bg-green-700 active:bg-green-800">
                OK
              </button>
            </form>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowManual(!showManual)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-semibold hover:bg-gray-50 active:bg-gray-100"
            >
              <Keyboard className="h-4 w-4" />
              Manual
            </button>
            <button
              onClick={handleClose}
              className="flex-1 rounded-2xl bg-red-50 border border-red-200 py-3 text-sm font-bold text-red-600 hover:bg-red-100 active:bg-red-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 10%; opacity: 1; }
          45%  { top: 88%; opacity: 1; }
          50%  { top: 88%; opacity: 0.3; }
          55%  { top: 88%; opacity: 1; }
          100% { top: 10%; opacity: 1; }
        }
      `}</style>
    </>
  );
}
