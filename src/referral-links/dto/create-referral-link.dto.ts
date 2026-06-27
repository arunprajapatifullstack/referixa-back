import { IsString } from 'class-validator';

export class CreateReferralLinkDto {
  @IsString()
  campaignId: string;

  @IsString()
  customerId: string;
}
