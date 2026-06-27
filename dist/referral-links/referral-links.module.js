"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralLinksModule = void 0;
const common_1 = require("@nestjs/common");
const referral_links_controller_1 = require("./referral-links.controller");
const referral_links_service_1 = require("./referral-links.service");
const mail_module_1 = require("../mail/mail.module");
let ReferralLinksModule = class ReferralLinksModule {
};
exports.ReferralLinksModule = ReferralLinksModule;
exports.ReferralLinksModule = ReferralLinksModule = __decorate([
    (0, common_1.Module)({
        imports: [mail_module_1.MailModule],
        controllers: [referral_links_controller_1.ReferralLinksController],
        providers: [referral_links_service_1.ReferralLinksService],
    })
], ReferralLinksModule);
//# sourceMappingURL=referral-links.module.js.map