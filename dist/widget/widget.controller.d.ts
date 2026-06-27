import { Response } from 'express';
import { WidgetService } from './widget.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class WidgetController {
    private widgetService;
    private prisma;
    constructor(widgetService: WidgetService, prisma: PrismaService);
    getEmbed(campaignId: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
