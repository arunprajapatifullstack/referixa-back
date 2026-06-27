import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'paused'])
  status?: string;

  @IsString()
  @IsIn(['percent', 'fixed', 'credit'])
  referrerRewardType: string;

  @IsNumber()
  @Type(() => Number)
  referrerRewardValue: number;

  @IsString()
  @IsIn(['percent', 'fixed', 'credit'])
  referredRewardType: string;

  @IsNumber()
  @Type(() => Number)
  referredRewardValue: number;
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'paused'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['percent', 'fixed', 'credit'])
  referrerRewardType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  referrerRewardValue?: number;

  @IsOptional()
  @IsString()
  @IsIn(['percent', 'fixed', 'credit'])
  referredRewardType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  referredRewardValue?: number;
}
