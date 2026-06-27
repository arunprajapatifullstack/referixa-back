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
exports.ReferralsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const referrals_service_1 = require("./referrals.service");
const convert_referral_dto_1 = require("./dto/convert-referral.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const business_decorator_1 = require("../common/decorators/business.decorator");
let ReferralsController = class ReferralsController {
    constructor(referralsService) {
        this.referralsService = referralsService;
    }
    findAll(businessId, campaignId, status) {
        return this.referralsService.findAll(businessId, campaignId, status);
    }
    convert(dto, req) {
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
        return this.referralsService.convert({ ...dto, ipAddress: ip });
    }
};
exports.ReferralsController = ReferralsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all referrals for a business' }),
    (0, swagger_1.ApiQuery)({ name: 'campaignId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    __param(0, (0, business_decorator_1.BusinessId)()),
    __param(1, (0, common_1.Query)('campaignId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReferralsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('convert'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert a referral (public, no auth)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [convert_referral_dto_1.ConvertReferralDto, Object]),
    __metadata("design:returntype", void 0)
], ReferralsController.prototype, "convert", null);
exports.ReferralsController = ReferralsController = __decorate([
    (0, swagger_1.ApiTags)('Referrals'),
    (0, common_1.Controller)('referrals'),
    __metadata("design:paramtypes", [referrals_service_1.ReferralsService])
], ReferralsController);
//# sourceMappingURL=referrals.controller.js.map