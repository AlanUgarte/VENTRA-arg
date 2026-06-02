'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, ScanLine, Keyboard } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [status, setStatus] = useState<'loading' | 'scanning' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (manualMode) return;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('barcode-scanner-container');
        scannerRef.current = scanner;
        if (!mountedRef.current) return;
        setStatus('scanning');

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 15, qrbox: { width: 260, height: 110 } },
          async (decodedText: string) => {
            if (!mountedRef.current) return;
            try { await scanner.stop(); } catch {}
            onScan(decodedText.trim());
          },
          undefined,
        );
      } catch {
        if (!mountedRef.current) return;
        setErrorMsg('No se pudo acceder a la cámara. Usá el ingreso manual.');
        setStatus('error');
        setManualMode(true);
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;
      if (scannerRef.current) scannerRef.current.stop().catch(() => {});
    };
  }, [manualMode, onScan]);

  const handleClose = () => {
    if (scannerRef.current) scannerRef.current.stop().catch(() => {});
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (code) onScan(code);
  };

  return (
    <>
      {/* Backdrop — toque fuera cierra */}
      <div className="fixed inset-0 z-50 bg-black/70" onClick={handleClose} />

      {/* Sheet desde abajo en mobile, centrado en desktop */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white shadow-2xl md:bottom-auto md:left-1/2 md:top-1/2 md:w-[400px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle — arrastrá para cerrar (visual) */}
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gray-200 md:hidden" />

        {/* Header con X grande */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Escanear código de barras</h3>
          </div>
          <button
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-xl font-bold hover:bg-muted/80 transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Camera area */}
          {!manualMode && (
            <>
              {status === 'loading' && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Iniciando cámara…</p>
                </div>
              )}
              {status === 'scanning' && (
                <div className="space-y-2">
                  <div id="barcode-scanner-container" style={{ borderRadius: 12, overflow: 'hidden' }} />
                  <p className="text-center text-xs text-muted-foreground">
                    Apuntá la cámara al código de barras
                  </p>
                </div>
              )}
            </>
          )}

          {/* Manual input */}
          {manualMode && (
            <div className="space-y-2">
              {errorMsg && (
                <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                  {errorMsg}
                </p>
              )}
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  placeholder="Escribí el código…"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 rounded-xl border border-border px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 text-sm font-bold text-white"
                >
                  Buscar
                </button>
              </form>
            </div>
          )}

          {/* Toggle cámara ↔ manual */}
          <div className="flex gap-2">
            {!manualMode ? (
              <button
                onClick={() => {
                  if (scannerRef.current) scannerRef.current.stop().catch(() => {});
                  setManualMode(true);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <Keyboard className="h-4 w-4" /> Ingresar manualmente
              </button>
            ) : (
              <button
                onClick={() => { setManualMode(false); setStatus('loading'); setErrorMsg(''); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <Camera className="h-4 w-4" /> Usar cámara
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex-1 rounded-2xl bg-muted py-3 text-sm font-bold hover:bg-muted/80 transition-colors"
            >
              Cancelar
            </button>
          </div>

          {/* Tip */}
          <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3 text-xs text-muted-foreground">
            💡 <strong>Para que funcione:</strong> el producto debe tener el código cargado en{' '}
            <strong>Inventario → Cód. Barras</strong>. Si escaneás y no lo encuentra, agregalo primero.
          </div>
        </div>
      </div>
    </>
  );
}
