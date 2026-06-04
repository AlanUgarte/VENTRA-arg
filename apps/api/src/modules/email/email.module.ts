import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailService } from './email.service';
import { TrialReminderService } from './trial-reminder.service';
import { BackupService } from './backup.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [EmailService, TrialReminderService, BackupService],
  exports: [EmailService],
})
export class EmailModule {}
