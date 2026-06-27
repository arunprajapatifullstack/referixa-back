import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { WidgetService } from './widget.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('widget')
export class WidgetController {
  constructor(
    private widgetService: WidgetService,
    private prisma: PrismaService,
  ) {}

  @Get(':campaignId/embed.js')
  async getEmbed(@Param('campaignId') campaignId: string, @Res() res: Response) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { business: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const script = this.widgetService.getEmbedScript(campaignId, campaign.business.name);

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    return res.send(script);
  }
}
