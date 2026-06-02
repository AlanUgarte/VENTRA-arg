'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [status, setStatus] = useState<'loading' | 'scanning' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Dynamic import to avoid SSR issues
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('barcode-scanner-container');
        scannerRef.current = scanner;

        if (!mountedRef.current) return;
        setStatus('scanning');

        await scanner.start(
          { facingMode: 'environment' }, // Cámara trasera
          {
            fps: 15,
            qrbox: { width: 280, height: 120 },
          },
          async (decodedText) => {
            if (!mountedRef.current) return;
            // Stop scanner and notify parent
            try { await scanner.stop(); } catch {}
            onScan(decodedText.trim());
          },
          undefined,
        );
      } catch (err: any) {
        if (!mountedRef.current) return;
        if (err?.message?.includes('Permission')) {
          setErrorMsg('Necesitás dar permiso a la cámara.');
        } else if (err?.message?.includes('No cameras')) {
          setErrorMsg('No se encontró cámara en este dispositivo.');
        } else {
          setErrorMsg('No se pudo acceder a la cámara. Ingresá el código manualmente.');
        }
        setStatus('error');
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Escanear código</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scanner area */}
        <div className="p-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Iniciando cámara...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-6 text-center space-y-3">
              <p className="text-sm text-destructive font-semibold">{errorMsg}</p>
              <p className="text-xs text-muted-foreground">Ingresá el código manualmente en el buscador del POS.</p>
            </div>
          )}

          {/* Camera viewfinder */}
          <div
            id="barcode-scanner-container"
            className={status === 'scanning' ? 'block' : 'hidden'}
            style={{ borderRadius: 12, overflow: 'hidden' }}
          />

          {status === 'scanning' && (
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                Apuntá la cámara al código de barras del producto
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Soporta EAN-13, EAN-8, Code128, QR
              </p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-border py-3 text-sm font-semibold hover:bg-muted transition-colors"
          >
            Cancelar — ingresar manualmente
          </button>
        </div>
      </div>
    </div>
  );
}
