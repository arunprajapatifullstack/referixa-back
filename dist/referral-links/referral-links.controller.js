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
exports.ReferralLinksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const referral_links_service_1 = require("./referral-links.service");
const create_referral_link_dto_1 = require("./dto/create-referral-link.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const business_decorator_1 = require("../common/decorators/business.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
let ReferralLinksController = class ReferralLinksController {
    constructor(referralLinksService, prisma) {
        this.referralLinksService = referralLinksService;
        this.prisma = prisma;
    }
    create(businessId, dto) {
        return this.referralLinksService.create(businessId, dto);
    }
    findByCampaign(businessId, campaignId) {
        return this.referralLinksService.findByCampaign(businessId, campaignId);
    }
    lookup(code) {
        return this.referralLinksService.lookupCode(code);
    }
    portal(code) {
        return this.referralLinksService.getCustomerPortal(code);
    }
    async redirect(code, res) {
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
        }
        catch {
            return res.redirect('http://localhost:3000');
        }
    }
};
exports.ReferralLinksController = ReferralLinksController;
__decorate([
    (0, common_1.Post)('referral-links'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new referral link for a customer' }),
    __param(0, (0, business_decorator_1.BusinessId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_referral_link_dto_1.CreateReferralLinkDto]),
    __metadata("design:returntype", void 0)
], ReferralLinksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('referral-links/campaign/:campaignId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all referral links for a campaign' }),
    __param(0, (0, business_decorator_1.BusinessId)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReferralLinksController.prototype, "findByCampaign", null);
__decorate([
    (0, common_1.Get)('referral-links/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Look up a referral link by code (public)' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralLinksController.prototype, "lookup", null);
__decorate([
    (0, common_1.Get)('referral-links/:code/portal'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer portal data by referral code (public)' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralLinksController.prototype, "portal", null);
__decorate([
    (0, common_1.Get)('r/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Track click and redirect to referral page (public)' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReferralLinksController.prototype, "redirect", null);
exports.ReferralLinksController = ReferralLinksController = __decorate([
    (0, swagger_1.ApiTags)('Referral Links'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [referral_links_service_1.ReferralLinksService,
        prisma_service_1.PrismaService])
], ReferralLinksController);
//# sourceMappingURL=referral-links.controller.js.map