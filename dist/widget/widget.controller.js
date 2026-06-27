"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetController = void 0;
const common_1 = require("@nestjs/common");
const widget_service_1 = require("./widget.service");
const prisma_service_1 = require("../prisma/prisma.service");
let WidgetController = class WidgetController {
    constructor(widgetService, prisma) {
        this.widgetService = widgetService;
        this.prisma = prisma;
    }
    async getEmbed(campaignId, res) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { business: true },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        const script = this.widgetService.getEmbedScript(campaignId, campaign.business.name);
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache');
        return res.send(script);
    }
};
exports.WidgetController = WidgetController;
__decorate([
    (0, common_1.Get)(':campaignId/embed.js'),
    __param(0, (0, common_1.Param)('campaignId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WidgetController.prototype, "getEmbed", null);
exports.WidgetController = WidgetController = __decorate([
    (0, common_1.Controller)('widget'),
    __metadata("design:paramtypes", [widget_service_1.WidgetService,
        prisma_service_1.PrismaService])
], WidgetController);
//# sourceMappingURL=widget.controller.js.map