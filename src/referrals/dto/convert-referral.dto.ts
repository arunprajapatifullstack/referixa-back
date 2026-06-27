import { IsString, IsEmail, IsOptional } from 'class-validator';

export class ConvertReferralDto {
  @IsString()
  code: string;

  @IsEmail()
  referredEmail: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
