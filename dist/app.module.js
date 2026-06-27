"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const customers_module_1 = require("./customers/customers.module");
const referral_links_module_1 = require("./referral-links/referral-links.module");
const referrals_module_1 = require("./referrals/referrals.module");
const rewards_module_1 = require("./rewards/rewards.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const widget_module_1 = require("./widget/widget.module");
const payments_module_1 = require("./payments/payments.module");
const mail_module_1 = require("./mail/mail.module");
const cache_module_1 = require("./cache/cache.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [{ ttl: 60000, limit: 100 }],
            }),
            cache_module_1.CacheModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            campaigns_module_1.CampaignsModule,
            customers_module_1.CustomersModule,
            referral_links_module_1.ReferralLinksModule,
            referrals_module_1.ReferralsModule,
            rewards_module_1.RewardsModule,
            dashboard_module_1.DashboardModule,
            widget_module_1.WidgetModule,
            payments_module_1.PaymentsModule,
            mail_module_1.MailModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map