import { Module } from '@nestjs/common';
import { ReferralLinksController } from './referral-links.controller';
import { ReferralLinksService } from './referral-links.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [ReferralLinksController],
  providers: [ReferralLinksService],
})
export class ReferralLinksModule {}
