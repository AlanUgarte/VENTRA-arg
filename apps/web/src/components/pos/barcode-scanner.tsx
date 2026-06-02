'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ScanLine, Keyboard, Camera, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(true);

  const [phase, setPhase] = useState<'starting' | 'scanning' | 'error'>('starting');
  const [errorMsg, setErrorMsg] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  useEffect(() => {
    mountedRef.current = true;
    let detector: any = null;

    const start = async () => {
      // 1. Request camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        if (!mountedRef.current) return;
        setErrorMsg('No se pudo abrir la cámara. Verificá que diste permiso al navegador.');
        setPhase('error');
        setShowManual(true);
        return;
      }

      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      // 2. Attach stream to video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          if (!mountedRef.current) return;
          setErrorMsg('No se pudo reproducir la cámara.');
          setPhase('error');
          setShowManual(true);
          return;
        }
      }

      if (!mountedRef.current) return;
      setPhase('scanning');

      // 3. BarcodeDetector API (Chrome Android, Chrome desktop, Safari 17+)
      const hasBarcodeDetector = 'BarcodeDetector' in window;

      if (hasBarcodeDetector) {
        try {
          detector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'],
          });
        } catch {
          detector = new (window as any).BarcodeDetector();
        }

        const detect = async () => {
          if (!mountedRef.current || !videoRef.current) return;
          if (videoRef.current.readyState >= 2) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                stopCamera();
                onScan(barcodes[0].rawValue);
                return;
              }
            } catch {}
          }
          rafRef.current = requestAnimationFrame(detect);
        };
        rafRef.current = requestAnimationFrame(detect);

      } else {
        // BarcodeDetector no disponible — mostrar ingreso manual
        if (mountedRef.current) {
          setErrorMsg('Tu navegador no soporta detección automática de códigos. Usá el ingreso manual.');
          setShowManual(true);
        }
      }
    };

    start();

    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [onScan, stopCamera]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (code) { stopCamera(); onScan(code); }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/75" onClick={handleClose} />

      {/* Sheet — sube desde abajo en mobile, centrado en desktop */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl rounded-t-3xl md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gray-200 md:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-green-600" />
            <span className="text-lg font-bold">Escanear código</span>
          </div>
          <button
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 text-xl font-bold hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Camera view — SIEMPRE en el DOM para que getUserMedia pueda adjuntarse */}
          <div className={phase === 'scanning' && !showManual ? 'block' : 'hidden'}>
            <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Visor guía */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-20 border-2 border-white/80 rounded-xl" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }} />
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <p className="text-center text-xs text-gray-500 mt-2">
              Apuntá el código de barras al rectángulo blanco
            </p>
          </div>

          {/* Loading */}
          {phase === 'starting' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <p className="text-sm text-gray-500">Abriendo cámara…</p>
            </div>
          )}

          {/* Error */}
          {phase === 'error' && errorMsg && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              {errorMsg}
            </div>
          )}

          {/* Manual input */}
          {showManual && (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                placeholder="Escribí el código de barras…"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-green-600 px-4 text-sm font-bold text-white hover:bg-green-700 transition-colors"
              >
                Buscar
              </button>
            </form>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            {phase === 'scanning' && !showManual && (
              <button
                onClick={() => setShowManual(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <Keyboard className="h-4 w-4" /> Manual
              </button>
            )}
            {showManual && phase !== 'starting' && (
              <button
                onClick={() => { setShowManual(false); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <Camera className="h-4 w-4" /> Cámara
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex-1 rounded-2xl bg-gray-100 py-3 text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>

          <p className="rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-xs text-green-800">
            💡 El producto debe tener el código cargado en <strong>Inventario</strong> para que funcione.
          </p>
        </div>
      </div>
    </>
  );
}
