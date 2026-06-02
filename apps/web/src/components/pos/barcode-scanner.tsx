'use client';
import { useEffect, useRef, useState } from 'react';
import { ScanLine, Keyboard, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const scannedRef = useRef(false);

  const [phase, setPhase] = useState<'starting' | 'scanning' | 'no-detector' | 'error'>('starting');
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);

  const stopAll = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const handleClose = () => { stopAll(); onClose(); };

  const handleFound = (code: string) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    stopAll();
    // Vibración táctil de feedback
    if ('vibrate' in navigator) navigator.vibrate(100);
    onScan(code);
  };

  useEffect(() => {
    mountedRef.current = true;
    scannedRef.current = false;

    const start = async () => {
      // Pedir cámara
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        if (!mountedRef.current) return;
        setPhase('error');
        setShowManual(true);
        return;
      }

      if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play().catch(() => {});
      }

      if (!mountedRef.current) return;

      // Chequear BarcodeDetector
      if (!('BarcodeDetector' in window)) {
        setPhase('no-detector');
        setShowManual(true);
        return;
      }

      setPhase('scanning');

      let detector: any;
      try {
        detector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'],
        });
      } catch {
        detector = new (window as any).BarcodeDetector();
      }

      // Loop de detección — cada 150ms para balance entre velocidad y CPU
      let last = 0;
      const detect = async (ts: number) => {
        if (!mountedRef.current || scannedRef.current) return;
        rafRef.current = requestAnimationFrame(detect);
        if (ts - last < 150) return; // ~6fps es suficiente para lectura
        last = ts;

        const video = videoRef.current;
        if (!video || video.readyState < 2 || video.videoWidth === 0) return;

        try {
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            handleFound(barcodes[0].rawValue);
          }
        } catch {}
      };

      rafRef.current = requestAnimationFrame(detect);
    };

    start();
    return () => { mountedRef.current = false; stopAll(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (code) { stopAll(); onScan(code); }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80" onClick={handleClose} />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-black rounded-t-3xl md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] md:rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-black">
          <div className="flex items-center gap-2 text-white">
            <ScanLine className="h-5 w-5 text-green-400" />
            <span className="font-bold">Escanear código de barras</span>
          </div>
          <button onClick={handleClose} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white text-lg font-bold hover:bg-white/20">✕</button>
        </div>

        {/* VIDEO — siempre montado en el DOM */}
        <div className="relative bg-black" style={{ aspectRatio: '4/3' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Overlay oscuro con ventana de escaneo */}
          {phase === 'scanning' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Esquinas del visor */}
              <div className="relative w-72 h-28">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                {/* Línea de escaneo animada */}
                <div className="absolute inset-x-0 h-0.5 bg-green-400 opacity-80" style={{ animation: 'scan 1.5s linear infinite', top: '50%' }} />
              </div>
            </div>
          )}

          {/* Estado inicial */}
          {phase === 'starting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
              <p className="text-white text-sm">Abriendo cámara…</p>
            </div>
          )}

          {/* Error de cámara */}
          {phase === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 p-4">
              <p className="text-white text-sm text-center">No se pudo acceder a la cámara.</p>
              <p className="text-gray-400 text-xs text-center">Verificá que el navegador tiene permiso de cámara en los ajustes.</p>
            </div>
          )}

          {/* Sin BarcodeDetector */}
          {phase === 'no-detector' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 p-4">
              <p className="text-white text-sm text-center">Este navegador no soporta lectura automática.</p>
              <p className="text-gray-400 text-xs text-center">Usá Chrome en Android para escaneo automático.</p>
            </div>
          )}
        </div>

        {/* Instrucción */}
        {phase === 'scanning' && (
          <p className="text-center text-green-400 text-xs py-2 bg-black">
            Apuntá el código de barras al rectángulo verde
          </p>
        )}

        {/* Manual input */}
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
                className="flex-1 rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" className="rounded-xl bg-green-600 px-4 text-sm font-bold text-white">Buscar</button>
            </form>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowManual(!showManual)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border py-2.5 text-sm font-semibold hover:bg-gray-50"
            >
              <Keyboard className="h-4 w-4" /> {showManual ? 'Ocultar manual' : 'Ingresar código'}
            </button>
            <button onClick={handleClose} className="flex-1 rounded-2xl bg-gray-100 py-2.5 text-sm font-bold hover:bg-gray-200">Cancelar</button>
          </div>
        </div>

        {/* Animación CSS para la línea de escaneo */}
        <style>{`
          @keyframes scan {
            0% { top: 10%; }
            50% { top: 90%; }
            100% { top: 10%; }
          }
        `}</style>
      </div>
    </>
  );
}
