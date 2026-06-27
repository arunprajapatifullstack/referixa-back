import {
  Controller, Get, Post, Body, Param, Res, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReferralLinksService } from './referral-links.service';
import { CreateReferralLinkDto } from './dto/create-referral-link.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BusinessId } from '../common/decorators/business.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Referral Links')
@Controller()
export class ReferralLinksController {
  constructor(
    private referralLinksService: ReferralLinksService,
    private prisma: PrismaService,
  ) {}

  @Post('referral-links')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new referral link for a customer' })
  create(@BusinessId() businessId: string, @Body() dto: CreateReferralLinkDto) {
    return this.referralLinksService.create(businessId, dto);
  }

  @Get('referral-links/campaign/:campaignId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all referral links for a campaign' })
  findByCampaign(
    @BusinessId() businessId: string,
    @Param('campaignId') campaignId: string,
  ) {
    return this.referralLinksService.findByCampaign(businessId, campaignId);
  }

  @Get('referral-links/:code')
  @ApiOperation({ summary: 'Look up a referral link by code (public)' })
  lookup(@Param('code') code: string) {
    return this.referralLinksService.lookupCode(code);
  }

  @Get('referral-links/:code/portal')
  @ApiOperation({ summary: 'Get customer portal data by referral code (public)' })
  portal(@Param('code') code: string) {
    return this.referralLinksService.getCustomerPortal(code);
  }

  @Get('r/:code')
  @ApiOperation({ summary: 'Track click and redirect to referral page (public)' })
  async redirect(@Param('code') code: string, @Res() res: Response) {
    try {
      const link = await this.referralLinksService.trackClick(code);
      const business = await this.prisma.business.findUnique({
        where: { id: link.campaign.businessId },
      });

      res.cookie('ref_code', code, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/refer/${code}`);
    } catch {
      return res.redirect('http://localhost:3000');
    }
  }
}
