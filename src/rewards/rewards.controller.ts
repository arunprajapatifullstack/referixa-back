import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BusinessId } from '../common/decorators/business.decorator';

@ApiTags('Rewards')
@Controller('rewards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get()
  @ApiOperation({ summary: 'List all rewards' })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @BusinessId() businessId: string,
    @Query('status') status?: string,
  ) {
    return this.rewardsService.findAll(businessId, status);
  }

  @Post('verify-pair')
  @ApiOperation({ summary: 'Verify two reward codes belong to the same referral pair' })
  verifyPair(
    @BusinessId() businessId: string,
    @Body('code1') code1: string,
    @Body('code2') code2: string,
  ) {
    return this.rewardsService.verifyPair(businessId, code1, code2);
  }

  @Post('redeem-by-code')
  @ApiOperation({ summary: 'Redeem a reward by its 8-character code' })
  redeemByCode(
    @BusinessId() businessId: string,
    @Body('code') code: string,
  ) {
    return this.rewardsService.redeemByCode(businessId, code);
  }

  @Post(':id/redeem')
  @ApiOperation({ summary: 'Redeem a reward by ID' })
  redeem(@BusinessId() businessId: string, @Param('id') id: string) {
    return this.rewardsService.redeem(businessId, id);
  }
}
