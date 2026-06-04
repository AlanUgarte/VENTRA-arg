import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  // Resumen diario a las 3:00 AM — estadísticas + recordatorio de backup
  @Cron('0 3 * * *')
  async sendDailyReport() {
    const adminEmail = this.config.get<string>('SMTP_USER');
    if (!adminEmail) return;

    try {
      const [tenants, sales, users] = await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.sale.count(),
        this.prisma.user.count({ where: { isSuperAdmin: false } }),
      ]);

      const today = new Date().toLocaleDateString('es-AR');

      await this.email['send'](
        adminEmail,
        `📊 Resumen diario VENTRA ARG — ${today}`,
        `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
          <h2 style="color:#0d9f6e">📊 Reporte diario — ${today}</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#666">Negocios registrados</td><td style="font-weight:bold">${tenants}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Usuarios totales</td><td style="font-weight:bold">${users}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Ventas procesadas (total)</td><td style="font-weight:bold">${sales}</td></tr>
          </table>
          <hr style="margin:20px 0;border-color:#e7e0d2">
          <p style="font-size:13px;color:#666">
            💾 <strong>Backup de DB:</strong> Para hacer un backup manual, ejecutá desde Railway CLI:<br>
            <code style="background:#f5f5f0;padding:4px 8px;border-radius:6px">railway connect Postgres</code><br>
            y luego: <code style="background:#f5f5f0;padding:4px 8px;border-radius:6px">\\copy (SELECT ...) TO 'backup.csv'</code>
          </p>
          <p style="font-size:12px;color:#999">VENTRA ARG · Sistema de gestión</p>
        </div>`,
      );

      this.logger.log(`Reporte diario enviado: ${tenants} tenants, ${sales} ventas`);
    } catch (e: any) {
      this.logger.error(`Error en reporte diario: ${e.message}`);
    }
  }
}
