import { money } from '@/lib/utils';

interface ReceiptLine {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ReceiptData {
  businessName?: string;
  businessPhone?: string;
  businessAddress?: string;
  businessTaxId?: string;
  orderNumber: number;
  date: Date;
  type: 'CASH' | 'CREDIT';
  customerName?: string;
  lines: ReceiptLine[];
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  total: number;
}

function dash(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number) {
  ctx.strokeStyle = '#d7dde6';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let s = text;
  while (s.length > 4 && ctx.measureText(s + '…').width > maxWidth) s = s.slice(0, -1);
  return s + '…';
}

export function drawReceipt(data: ReceiptData): HTMLCanvasElement {
  const S = 2;
  const W = 440;
  const P = 28;
  const lineH = 40;

  const extraHeader =
    (data.businessPhone   ? 16 : 0) +
    (data.businessAddress ? 16 : 0) +
    (data.businessTaxId   ? 16 : 0);

  const h =
    P + 40 + extraHeader + 22 + 24 +
    (data.customerName ? 22 : 0) +
    18 + 26 +
    data.lines.length * lineH +
    18 + (data.discountPct > 0 ? 22 : 0) + 22 + 44 +
    18 + 56 + P;

  const cv = document.createElement('canvas');
  cv.width = W * S;
  cv.height = h * S;
  const ctx = cv.getContext('2d')!;
  ctx.scale(S, S);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, h);

  let y = P;

  // Nombre del negocio
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0d9f6e';
  ctx.font = '800 30px Hanken Grotesk, sans-serif';
  ctx.fillText(data.businessName || 'Mi negocio', W / 2, y + 10);
  y += 34;

  // Datos de contacto opcionales
  ctx.fillStyle = '#697586';
  ctx.font = '400 11px IBM Plex Mono, monospace';
  if (data.businessPhone) {
    ctx.fillText(`Tel: ${data.businessPhone}`, W / 2, y);
    y += 16;
  }
  if (data.businessAddress) {
    ctx.fillText(data.businessAddress, W / 2, y);
    y += 16;
  }
  if (data.businessTaxId) {
    ctx.fillText(`CUIT: ${data.businessTaxId}`, W / 2, y);
    y += 16;
  }

  ctx.fillStyle = '#697586';
  ctx.font = '600 11px IBM Plex Mono, monospace';
  ctx.fillText('COMPROBANTE DE VENTA', W / 2, y);
  y += 20;

  ctx.fillStyle = data.type === 'CREDIT' ? '#7c5cff' : '#131922';
  ctx.font = '700 12px Hanken Grotesk, sans-serif';
  ctx.fillText(data.type === 'CREDIT' ? 'CUENTA CORRIENTE (FIADO)' : 'CONTADO', W / 2, y);
  y += 22;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#131922';
  ctx.font = '400 12px IBM Plex Mono, monospace';
  ctx.fillText(`N° ${String(data.orderNumber).padStart(4, '0')}`, P, y);
  ctx.textAlign = 'right';
  const dateStr =
    data.date.toLocaleDateString('es-AR') +
    ' ' +
    data.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  ctx.fillText(dateStr, W - P, y);
  y += 18;

  if (data.customerName) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#697586';
    ctx.font = '600 12px Hanken Grotesk, sans-serif';
    ctx.fillText(`Cliente: ${data.customerName}`, P, y);
    y += 20;
  }

  dash(ctx, P, y, W - P);
  y += 20;

  ctx.font = '600 11px Hanken Grotesk, sans-serif';
  ctx.fillStyle = '#697586';
  ctx.textAlign = 'left';
  ctx.fillText('DETALLE', P, y);
  ctx.textAlign = 'right';
  ctx.fillText('IMPORTE', W - P, y);
  y += 18;

  for (const line of data.lines) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#131922';
    ctx.font = '600 13px Hanken Grotesk, sans-serif';
    ctx.fillText(fit(ctx, `${line.quantity}× ${line.name}`, W - P * 2 - 70), P, y + 6);
    ctx.fillStyle = '#697586';
    ctx.font = '400 11px IBM Plex Mono, monospace';
    ctx.fillText(`${money(line.unitPrice)} c/u`, P, y + 20);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#131922';
    ctx.font = '600 14px IBM Plex Mono, monospace';
    ctx.fillText(money(line.subtotal), W - P, y + 8);
    y += lineH;
  }

  dash(ctx, P, y, W - P);
  y += 20;

  // Subtotal
  ctx.textAlign = 'left';
  ctx.fillStyle = '#697586';
  ctx.font = '400 13px Hanken Grotesk, sans-serif';
  ctx.fillText('Subtotal', P, y);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#131922';
  ctx.font = '500 13px IBM Plex Mono, monospace';
  ctx.fillText(money(data.subtotal), W - P, y);
  y += 22;

  if (data.discountPct > 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f0653e';
    ctx.font = '400 13px Hanken Grotesk, sans-serif';
    ctx.fillText(`Descuento (${data.discountPct}%)`, P, y);
    ctx.textAlign = 'right';
    ctx.font = '500 13px IBM Plex Mono, monospace';
    ctx.fillText(`−${money(data.discountAmount)}`, W - P, y);
    y += 22;
  }

  // Total
  ctx.textAlign = 'left';
  ctx.fillStyle = '#131922';
  ctx.font = '800 20px Hanken Grotesk, sans-serif';
  ctx.fillText('TOTAL', P, y + 8);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0d9f6e';
  ctx.font = '700 22px IBM Plex Mono, monospace';
  ctx.fillText(money(data.total), W - P, y + 8);
  y += 40;

  dash(ctx, P, y, W - P);
  y += 24;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#131922';
  ctx.font = '700 14px Hanken Grotesk, sans-serif';
  ctx.fillText('¡Gracias por su compra!', W / 2, y);
  y += 18;
  ctx.fillStyle = '#9aa3b0';
  ctx.font = '400 10px Hanken Grotesk, sans-serif';
  ctx.fillText('Comprobante no válido como factura oficial', W / 2, y);

  return cv;
}

export async function shareOrDownloadReceipt(canvas: HTMLCanvasElement, orderNumber: number) {
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve as any, 'image/png'));
  if (!blob) return;

  const file = new File([blob], `comprobante-${String(orderNumber).padStart(4, '0')}.png`, {
    type: 'image/png',
  });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Comprobante de venta' });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }
}
