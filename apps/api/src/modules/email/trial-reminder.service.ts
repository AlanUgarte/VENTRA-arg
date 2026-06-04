import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class TrialReminderService {
  private readonly logger = new Logger(TrialReminderService.name);

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  // Corre todos los días a las 10:00 AM
  @Cron('0 10 * * *')
  async sendTrialReminders() {
    this.logger.log('Revisando trials por vencer...');
    const now = new Date();

    // Tenants con trial que vence en 1 o 2 días
    const [in1day, in2days] = await Promise.all([
      this.getExpiringTrials(now, 1),
      this.getExpiringTrials(now, 2),
    ]);

    let sent = 0;
    for (const tenant of [...in1day, ...in2days]) {
      const daysLeft = in1day.some(t => t.id === tenant.id) ? 1 : 2;
      const owner = tenant.users.find((u: any) => u.role === 'OWNER');
      if (!owner) continue;
      await this.email.sendTrialExpiring(owner.email, owner.name, tenant.name, daysLeft);
      sent++;
    }

    this.logger.log(`Recordatorios de trial enviados: ${sent}`);
  }

  private async getExpiringTrials(now: Date, daysFromNow: number) {
    const start = new Date(now);
    start.setDate(start.getDate() + daysFromNow);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    return this.prisma.tenant.findMany({
      where: {
        subscription: {
          status: 'TRIAL',
          trialEndsAt: { gte: start, lte: end },
        },
      },
      include: {
        users: { where: { role: 'OWNER', isActive: true }, select: { name: true, email: true, role: true } },
      },
    });
  }
}
