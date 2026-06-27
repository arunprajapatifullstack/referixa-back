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
exports.RewardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rewards_service_1 = require("./rewards.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const business_decorator_1 = require("../common/decorators/business.decorator");
let RewardsController = class RewardsController {
    constructor(rewardsService) {
        this.rewardsService = rewardsService;
    }
    findAll(businessId, status) {
        return this.rewardsService.findAll(businessId, status);
    }
    verifyPair(businessId, code1, code2) {
        return this.rewardsService.verifyPair(businessId, code1, code2);
    }
    redeemByCode(businessId, code) {
        return this.rewardsService.redeemByCode(businessId, code);
    }
    redeem(businessId, id) {
        return this.rewardsService.redeem(businessId, id);
    }
};
exports.RewardsController = RewardsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all rewards' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    __param(0, (0, business_decorator_1.BusinessId)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RewardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('verify-pair'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify two reward codes belong to the same referral pair' }),
    __param(0, (0, business_decorator_1.BusinessId)()),
    __param(1, (0, common_1.Body)('code1')),
    __param(2, (0, common_1.Body)('code2')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RewardsController.prototype, "verifyPair", null);
__decorate([
    (0, common_1.Post)('redeem-by-code'),
    (0, swagger_1.ApiOperation)({ summary: 'Redeem a reward by its 8-character code' }),
    __param(0, (0, business_decorator_1.BusinessId)()),
    __param(1, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RewardsController.prototype, "redeemByCode", null);
__decorate([
    (0, common_1.Post)(':id/redeem'),
    (0, swagger_1.ApiOperation)({ summary: 'Redeem a reward by ID' }),
    __param(0, (0, business_decorator_1.BusinessId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RewardsController.prototype, "redeem", null);
exports.RewardsController = RewardsController = __decorate([
    (0, swagger_1.ApiTags)('Rewards'),
    (0, common_1.Controller)('rewards'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [rewards_service_1.RewardsService])
], RewardsController);
//# sourceMappingURL=rewards.controller.js.map