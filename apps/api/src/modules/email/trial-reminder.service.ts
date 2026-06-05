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

  // Corre todos los días a las 9:00 AM
  @Cron('0 9 * * *')
  async sendTrialReminders() {
    try {
      const now = new Date();
      const in2days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const in2daysEnd = new Date(in2days);
      in2daysEnd.setHours(23, 59, 59, 999);

      // Pruebas que vencen en 2 días
      const expiringIn2 = await this.prisma.subscription.findMany({
        where: {
          status: 'TRIAL',
          trialEndsAt: { gte: in2days, lte: in2daysEnd },
        },
        include: {
          tenant: {
            include: {
              users: { where: { role: 'OWNER', isActive: true }, take: 1 },
            },
          },
        },
      });

      for (const sub of expiringIn2) {
        const owner = sub.tenant.users[0];
        if (!owner) continue;
        await this.email.sendTrialExpiring(owner.email, owner.name, sub.tenant.name, 2).catch(() => {});
        this.logger.log(`Trial reminder (2d) sent to ${owner.email}`);
      }

      // Pruebas que vencen hoy
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      const expiringToday = await this.prisma.subscription.findMany({
        where: {
          status: 'TRIAL',
          trialEndsAt: { gte: todayStart, lte: todayEnd },
        },
        include: {
          tenant: {
            include: {
              users: { where: { role: 'OWNER', isActive: true }, take: 1 },
            },
          },
        },
      });

      for (const sub of expiringToday) {
        const owner = sub.tenant.users[0];
        if (!owner) continue;
        await this.email.sendTrialExpiring(owner.email, owner.name, sub.tenant.name, 0).catch(() => {});
        this.logger.log(`Trial reminder (today) sent to ${owner.email}`);
      }

      // Suscripciones activas que vencen en 3 días
      const in3days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const in3daysEnd = new Date(in3days);
      in3daysEnd.setHours(23, 59, 59, 999);

      const renewals = await this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: { gte: in3days, lte: in3daysEnd },
        },
        include: {
          tenant: {
            include: {
              users: { where: { role: 'OWNER', isActive: true }, take: 1 },
            },
          },
        },
      });

      for (const sub of renewals) {
        const owner = sub.tenant.users[0];
        if (!owner) continue;
        await this.email.sendRenewalReminder(owner.email, owner.name, sub.tenant.name, sub.plan).catch(() => {});
        this.logger.log(`Renewal reminder sent to ${owner.email}`);
      }

    } catch (e: any) {
      this.logger.error(`Error in trial reminders cron: ${e.message}`);
    }
  }
}
