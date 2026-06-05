import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { TrialReminderService } from './trial-reminder.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [EmailService, TrialReminderService],
  exports: [EmailService],
})
export class EmailModule {}
