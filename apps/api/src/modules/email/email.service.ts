import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = config.get('SMTP_HOST');
    const user = config.get('SMTP_USER');
    const pass = config.get('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn(`SMTP desactivado — faltan vars: host=${!!host} user=${!!user} pass=${!!pass}`);
      return;
    }

    const port = config.get<number>('SMTP_PORT', 587);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    // Verificar conexión al arrancar
    this.transporter.verify().then(() => {
      this.logger.log(`SMTP OK — conectado a ${host}:${port} como ${user}`);
    }).catch((err: any) => {
      this.logger.error(`SMTP FALLO al verificar: ${err.message}`);
      this.transporter = null;
    });
  }

  private get from() {
    return this.config.get('SMTP_FROM', `VENTRA ARG <${this.config.get('SMTP_USER')}>`);
  }

  private get appUrl() {
    return this.config.get('APP_URL', 'https://ventra-arg.vercel.app');
  }

  /** Envía un email de forma no bloqueante — si falla, loguea y sigue */
  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) return;
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email enviado a ${to}: ${subject}`);
    } catch (e: any) {
      this.logger.error(`Error enviando email a ${to}: ${e.message}`);
    }
  }

  // ─── Templates ───────────────────────────────────────────────────────────

  async sendWelcome(email: string, ownerName: string, businessName: string) {
    const subject = `¡Bienvenido a VENTRA ARG, ${ownerName}!`;
    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f0; margin: 0; padding: 20px; color: #1a1c1a; }
  .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
  .header { background: linear-gradient(135deg, #0d9f6e, #10b981); padding: 36px 32px; text-align: center; }
  .logo { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -.5px; }
  .logo span { opacity: .7; font-size: 14px; display: block; margin-top: 4px; font-weight: 400; }
  .body { padding: 36px 32px; }
  .greeting { font-size: 22px; font-weight: 800; margin-bottom: 12px; }
  .text { font-size: 15px; color: #5d6b5f; line-height: 1.6; margin-bottom: 16px; }
  .badge { display: inline-block; background: #e2f4ec; color: #0a7e57; font-weight: 700; padding: 6px 14px; border-radius: 20px; font-size: 13px; margin-bottom: 24px; }
  .btn { display: block; background: #0d9f6e; color: #fff !important; text-decoration: none; text-align: center; padding: 16px 24px; border-radius: 14px; font-weight: 800; font-size: 16px; margin: 24px 0; }
  .features { background: #f8faf8; border-radius: 14px; padding: 20px 24px; margin: 20px 0; }
  .feature { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 14px; }
  .feature:last-child { margin-bottom: 0; }
  .check { color: #0d9f6e; font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .footer { border-top: 1px solid #e7e0d2; padding: 20px 32px; text-align: center; font-size: 12px; color: #9aa3b0; }
  .trial { background: #fdf2d8; border: 1px solid #e3c56c; color: #7a5c00; padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">A Almacén <span>Sistema de gestión por VENTRA ARG</span></div>
  </div>
  <div class="body">
    <p class="greeting">¡Hola, ${ownerName}! 👋</p>
    <p class="text">Tu cuenta para <strong>${businessName}</strong> ya está lista. Podés empezar a usar el sistema ahora mismo.</p>
    <div class="trial">⏳ Tenés <strong>7 días de prueba gratuita</strong> con todas las funciones habilitadas. Sin tarjeta requerida.</div>
    <div class="features">
      <div class="feature"><span class="check">✓</span><span><strong>Punto de venta</strong> — cobrá con ticket y comprobante en segundos</span></div>
      <div class="feature"><span class="check">✓</span><span><strong>Inventario y stock</strong> — controlá lo que entra y sale</span></div>
      <div class="feature"><span class="check">✓</span><span><strong>Clientes y fiados</strong> — llevá la cuenta corriente actualizada</span></div>
      <div class="feature"><span class="check">✓</span><span><strong>Código de barras</strong> — escaneá con el celular en el POS</span></div>
      <div class="feature"><span class="check">✓</span><span><strong>Reportes</strong> — mirá tu facturación y ganancia en tiempo real</span></div>
    </div>
    <a href="${this.appUrl}/pos" class="btn">Entrar al sistema →</a>
    <p class="text" style="font-size:13px">Si tenés dudas, respondé este email y te ayudamos.</p>
  </div>
  <div class="footer">
    VENTRA ARG · Sistema de gestión para kioscos y almacenes · Hecho en Argentina 🇦🇷<br>
    Este email fue enviado a ${email}
  </div>
</div>
</body>
</html>`;
    await this.send(email, subject, html);
  }

  async sendPasswordReset(email: string, userName: string, resetLink: string) {
    const subject = `Recuperar contraseña — VENTRA ARG`;
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f0;margin:0;padding:20px;color:#1a1c1a}
  .c{max-width:560px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .h{background:linear-gradient(135deg,#0d9f6e,#10b981);padding:32px;text-align:center;color:#fff;font-size:26px;font-weight:900}
  .b{padding:36px 32px}.t{font-size:22px;font-weight:800;margin-bottom:12px}
  .p{font-size:15px;color:#5d6b5f;line-height:1.6;margin-bottom:16px}
  .btn{display:block;background:#0d9f6e;color:#fff!important;text-decoration:none;text-align:center;padding:16px 24px;border-radius:14px;font-weight:800;font-size:16px;margin:24px 0}
  .w{background:#fdf2d8;border:1px solid #e3c56c;color:#7a5c00;padding:12px 16px;border-radius:12px;font-size:13px}
  .f{border-top:1px solid #e7e0d2;padding:20px 32px;text-align:center;font-size:12px;color:#9aa3b0}
</style></head>
<body><div class="c">
  <div class="h">A Almacén</div>
  <div class="b">
    <p class="t">¿Olvidaste tu contraseña?</p>
    <p class="p">Hola <strong>${userName}</strong>, recibimos una solicitud para restablecer tu contraseña.</p>
    <a href="${resetLink}" class="btn">Restablecer contraseña →</a>
    <div class="w">⏰ Este link expira en <strong>1 hora</strong>. Si no lo usás, tu contraseña no cambia.</div>
    <p class="p" style="margin-top:16px;font-size:13px">Si no pediste esto, ignorá este email.</p>
  </div>
  <div class="f">VENTRA ARG · Hecho en Argentina 🇦🇷<br>Este email fue enviado a ${email}</div>
</div></body></html>`;
    await this.send(email, subject, html);
  }

  async sendTrialExpiring(email: string, userName: string, businessName: string, daysLeft: number) {
    const subject = `⏳ Tu prueba de VENTRA ARG vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`;
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f0;margin:0;padding:20px;color:#1a1c1a}
  .c{max-width:560px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .h{background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;text-align:center;color:#fff;font-size:26px;font-weight:900}
  .b{padding:36px 32px}.t{font-size:22px;font-weight:800;margin-bottom:12px}
  .p{font-size:15px;color:#5d6b5f;line-height:1.6;margin-bottom:16px}
  .btn{display:block;background:#0d9f6e;color:#fff!important;text-decoration:none;text-align:center;padding:16px 24px;border-radius:14px;font-weight:800;font-size:16px;margin:24px 0}
  .w{background:#fef3cd;border:1px solid #ffc107;color:#664d03;padding:16px;border-radius:12px;font-size:14px;font-weight:600}
  .f{border-top:1px solid #e7e0d2;padding:20px 32px;text-align:center;font-size:12px;color:#9aa3b0}
</style></head>
<body><div class="c">
  <div class="h">⏳ Tu prueba vence pronto</div>
  <div class="b">
    <p class="t">Hola, ${userName}</p>
    <div class="w">Tu prueba gratuita de <strong>${businessName}</strong> vence en <strong>${daysLeft} día${daysLeft !== 1 ? 's' : ''}</strong>.</div>
    <p class="p" style="margin-top:16px">Para seguir usando el sistema sin interrupciones, elegí tu plan ahora.</p>
    <a href="${this.appUrl}/billing" class="btn">Elegir mi plan →</a>
    <p class="p" style="font-size:13px">Plan Básico desde <strong>$15.000/mes</strong> · Plan Profesional <strong>$30.000/mes</strong><br>Sin tarjeta requerida para probar.</p>
  </div>
  <div class="f">VENTRA ARG · Hecho en Argentina 🇦🇷</div>
</div></body></html>`;
    await this.send(email, subject, html);
  }

  async sendPaymentNotification(
    adminEmail: string,
    businessName: string,
    ownerName: string,
    ownerEmail: string,
    planName: string,
    planPrice: number,
    adminUrl: string,
  ) {
    const subject = `💰 Nuevo pago recibido — ${businessName} quiere activar Plan ${planName}`;
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f0;margin:0;padding:20px;color:#1a1c1a}
  .c{max-width:560px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .h{background:linear-gradient(135deg,#0d9f6e,#10b981);padding:32px;text-align:center;color:#fff;font-size:24px;font-weight:900}
  .b{padding:36px 32px}.t{font-size:22px;font-weight:800;margin-bottom:16px}
  .info{background:#f8faf8;border:1px solid #e7e0d2;border-radius:14px;padding:20px 24px;margin:20px 0}
  .row{display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px}
  .row:last-child{margin-bottom:0}.label{color:#5d6b5f;font-weight:600}.val{font-weight:700}
  .btn{display:block;background:#0d9f6e;color:#fff!important;text-decoration:none;text-align:center;padding:16px 24px;border-radius:14px;font-weight:800;font-size:16px;margin:24px 0}
  .f{border-top:1px solid #e7e0d2;padding:20px 32px;text-align:center;font-size:12px;color:#9aa3b0}
  .amount{font-size:28px;font-weight:900;color:#0d9f6e;text-align:center;padding:12px 0}
</style></head>
<body><div class="c">
  <div class="h">💰 Notificación de pago</div>
  <div class="b">
    <p class="t">Un cliente realizó una transferencia</p>
    <p class="amount">$${planPrice.toLocaleString('es-AR')} ARS</p>
    <div class="info">
      <div class="row"><span class="label">Negocio</span><span class="val">${businessName}</span></div>
      <div class="row"><span class="label">Dueño</span><span class="val">${ownerName}</span></div>
      <div class="row"><span class="label">Email</span><span class="val">${ownerEmail}</span></div>
      <div class="row"><span class="label">Plan solicitado</span><span class="val">${planName}</span></div>
    </div>
    <p style="font-size:14px;color:#5d6b5f">Verificá la transferencia en tu cuenta bancaria y activá el plan desde el panel de administración.</p>
    <a href="${adminUrl}" class="btn">Ir al panel de admin →</a>
  </div>
  <div class="f">VENTRA ARG · Panel de administración</div>
</div></body></html>`;
    await this.send(adminEmail, subject, html);
  }

  async sendRenewalReminder(email: string, userName: string, businessName: string, plan: string) {
    const subject = `⏰ Tu suscripción de VENTRA ARG vence en 3 días`;
    const planName = plan === 'PRO' ? 'Plan Profesional ($30.000/mes)' : 'Plan Básico ($15.000/mes)';
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f0;margin:0;padding:20px;color:#1a1c1a}
  .c{max-width:560px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .h{background:linear-gradient(135deg,#2f6fed,#4f8fff);padding:32px;text-align:center;color:#fff;font-size:26px;font-weight:900}
  .b{padding:36px 32px}.t{font-size:22px;font-weight:800;margin-bottom:12px}
  .p{font-size:15px;color:#5d6b5f;line-height:1.6;margin-bottom:16px}
  .btn{display:block;background:#0d9f6e;color:#fff!important;text-decoration:none;text-align:center;padding:16px 24px;border-radius:14px;font-weight:800;font-size:16px;margin:24px 0}
  .info{background:#f8faf8;border-radius:14px;padding:16px 20px;font-size:14px;margin:16px 0}
  .f{border-top:1px solid #e7e0d2;padding:20px 32px;text-align:center;font-size:12px;color:#9aa3b0}
</style></head>
<body><div class="c">
  <div class="h">⏰ Tu suscripción vence pronto</div>
  <div class="b">
    <p class="t">Hola, ${userName}</p>
    <p class="p">Tu suscripción de <strong>${businessName}</strong> vence en <strong>3 días</strong>.</p>
    <div class="info">
      <strong>Plan actual:</strong> ${planName}<br>
      <strong>Negocio:</strong> ${businessName}
    </div>
    <p class="p">Si usás Mercado Pago, el cobro se realiza automáticamente. Si pagás por transferencia, asegurate de renovar antes del vencimiento.</p>
    <a href="${this.appUrl}/billing" class="btn">Ver mi suscripción →</a>
  </div>
  <div class="f">VENTRA ARG · Hecho en Argentina 🇦🇷</div>
</div></body></html>`;
    await this.send(email, subject, html);
  }

  async sendNewEmployee(
    email: string,
    employeeName: string,
    businessName: string,
    password: string,
  ) {
    const subject = `Tu acceso a ${businessName} — VENTRA ARG`;
    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f0; margin: 0; padding: 20px; color: #1a1c1a; }
  .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
  .header { background: linear-gradient(135deg, #0d9f6e, #10b981); padding: 36px 32px; text-align: center; }
  .logo { font-size: 28px; font-weight: 900; color: #fff; }
  .body { padding: 36px 32px; }
  .greeting { font-size: 22px; font-weight: 800; margin-bottom: 12px; }
  .text { font-size: 15px; color: #5d6b5f; line-height: 1.6; margin-bottom: 16px; }
  .credentials { background: #f8faf8; border: 1px solid #e7e0d2; border-radius: 14px; padding: 20px 24px; margin: 20px 0; }
  .cred-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 14px; }
  .cred-row:last-child { margin-bottom: 0; }
  .cred-label { color: #5d6b5f; font-weight: 600; }
  .cred-value { font-family: monospace; font-weight: 700; background: #e2f4ec; color: #0a7e57; padding: 4px 10px; border-radius: 8px; }
  .btn { display: block; background: #0d9f6e; color: #fff !important; text-decoration: none; text-align: center; padding: 16px 24px; border-radius: 14px; font-weight: 800; font-size: 16px; margin: 24px 0; }
  .warning { background: #fef3cd; border: 1px solid #ffc107; border-radius: 12px; padding: 12px 16px; font-size: 13px; color: #664d03; margin-bottom: 16px; }
  .footer { border-top: 1px solid #e7e0d2; padding: 20px 32px; text-align: center; font-size: 12px; color: #9aa3b0; }
  .permissions { font-size: 13px; color: #5d6b5f; background: #f8faf8; border-radius: 12px; padding: 16px; margin: 16px 0; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">A Almacén</div>
  </div>
  <div class="body">
    <p class="greeting">¡Hola, ${employeeName}! 👋</p>
    <p class="text">El dueño de <strong>${businessName}</strong> te creó una cuenta en el sistema de gestión VENTRA ARG.</p>
    <div class="credentials">
      <p style="font-weight:800;margin-bottom:14px;font-size:14px">Tus credenciales de acceso:</p>
      <div class="cred-row">
        <span class="cred-label">Email</span>
        <span class="cred-value">${email}</span>
      </div>
      <div class="cred-row">
        <span class="cred-label">Contraseña</span>
        <span class="cred-value">${password}</span>
      </div>
      <div class="cred-row">
        <span class="cred-label">Negocio</span>
        <span class="cred-value">${businessName}</span>
      </div>
    </div>
    <div class="warning">⚠️ <strong>Importante:</strong> Cambiá tu contraseña después del primer ingreso.</div>
    <div class="permissions">
      <strong>Tu acceso incluye:</strong> Punto de venta · Inventario · Clientes y fiados · Proveedores<br>
      <em>Nota: Los reportes financieros y la configuración son visibles solo para el dueño.</em>
    </div>
    <a href="${this.appUrl}/login" class="btn">Ingresar al sistema →</a>
  </div>
  <div class="footer">
    VENTRA ARG · Sistema de gestión · Hecho en Argentina 🇦🇷<br>
    Este email fue enviado a ${email}
  </div>
</div>
</body>
</html>`;
    await this.send(email, subject, html);
  }
}
