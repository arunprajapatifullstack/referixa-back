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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mail_1 = require("@sendgrid/mail");
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
let MailService = class MailService {
    constructor(config) {
        this.config = config;
        this.sgMail = new mail_1.MailService();
        this.sgMail.setApiKey(this.config.get('SENDGRID_API_KEY'));
        this.from = this.config.get('SENDER_EMAIL');
    }
    layout(content) {
        return `
      <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        ${content}
        <div style="text-align:center;padding:24px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">ReferLoop — Referral Rewards Platform</p>
          <p style="margin:0;font-size:11px;color:#d1d5db;">You received this email because you participated in a referral program.</p>
        </div>
      </div>
    `;
    }
    header(bg, title) {
        return `
      <div style="background:${bg};padding:36px 32px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${title}</h1>
      </div>
    `;
    }
    body(content) {
        return `
      <div style="padding:36px 32px;background:#ffffff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;">
        ${content}
      </div>
    `;
    }
    async sendReferralLink(email, customerName, campaignName, code) {
        const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
        const link = `${frontendUrl}/refer/${code}`;
        const safeName = escapeHtml(customerName);
        const safeCampaign = escapeHtml(campaignName);
        await this.sgMail.send({
            to: email,
            from: this.from,
            subject: `You're invited! Share & earn with ${safeCampaign}`,
            html: this.layout(`
        ${this.header('linear-gradient(135deg,#6366f1,#8b5cf6)', 'You\u2019re Invited!')}
        ${this.body(`
          <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 16px;">Hi ${safeName},</p>
          <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 24px;">
            You've been selected to participate in <strong style="color:#111827;">${safeCampaign}</strong>.
            Share your personal referral link with friends and earn rewards when they join.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${link}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;box-shadow:0 4px 12px rgba(99,102,241,0.3);">Share Your Link</a>
          </div>
          <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin:24px 0;">
            <p style="color:#6b7280;font-size:13px;font-weight:500;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;">Your Referral Link</p>
            <p style="color:#4f46e5;font-size:14px;font-family:monospace;margin:0;word-break:break-all;letter-spacing:0.3px;">${link}</p>
          </div>
          <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:24px 0 0;text-align:center;">When a friend joins through your link, you both earn rewards instantly.</p>
        `)}
      `),
        });
    }
    async sendConversionRewards(referredEmail, referredName, referrerName, campaignName, referredCode, referredReward, newReferralCode, frontendUrl) {
        const shareLink = `${frontendUrl}/refer/${newReferralCode}`;
        const safeReferred = escapeHtml(referredName);
        const safeReferrer = escapeHtml(referrerName);
        const safeCampaign = escapeHtml(campaignName);
        await this.sgMail.send({
            to: referredEmail,
            from: this.from,
            subject: `You got a reward from ${safeReferrer}! Plus your own referral link inside`,
            html: this.layout(`
        ${this.header('linear-gradient(135deg,#059669,#10b981)', 'Reward Claimed!')}
        ${this.body(`
          <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 16px;">Hi ${safeReferred},</p>
          <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 24px;">
            You've successfully claimed your reward through <strong style="color:#111827;">${safeCampaign}</strong>.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;text-align:center;margin:20px 0 28px;">
            <p style="color:#6b7280;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Your Reward</p>
            <p style="color:#059669;font-size:32px;font-weight:800;margin:0 0 12px;letter-spacing:-1px;">${referredReward}</p>
            <div style="background:#ffffff;border:2px dashed #86efac;border-radius:8px;padding:10px 24px;display:inline-block;">
              <p style="font-family:monospace;font-size:20px;font-weight:700;color:#059669;margin:0;letter-spacing:3px;">${referredCode}</p>
            </div>
            <p style="color:#6b7280;font-size:13px;margin:12px 0 0;">Save this code to redeem your reward</p>
          </div>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px;text-align:center;">Referred by <strong style="color:#374151;">${safeReferrer}</strong></p>
          <div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-top:24px;">
            <p style="color:#111827;font-size:16px;font-weight:600;margin:0 0 6px;text-align:center;">Now share & earn too!</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px;text-align:center;">Share your own referral link with friends. When they join, you both earn rewards!</p>
            <div style="text-align:center;margin:16px 0;">
              <a href="${shareLink}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(99,102,241,0.3);">Share Your Link</a>
            </div>
            <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin:16px 0 0;">
              <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">Or share this link:</p>
              <p style="color:#4f46e5;font-size:13px;font-family:monospace;margin:0;word-break:break-all;">${shareLink}</p>
            </div>
          </div>
        `)}
      `),
        });
    }
    async sendReferrerRewardNotification(referrerEmail, referrerName, referredName, campaignName, referrerCode, referrerReward) {
        const safeReferrer = escapeHtml(referrerName);
        const safeReferred = escapeHtml(referredName);
        const safeCampaign = escapeHtml(campaignName);
        await this.sgMail.send({
            to: referrerEmail,
            from: this.from,
            subject: `You earned a reward! ${safeReferred} joined through your link`,
            html: this.layout(`
        ${this.header('linear-gradient(135deg,#d97706,#f59e0b)', 'You Earned a Reward!')}
        ${this.body(`
          <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 16px;">Hi ${safeReferrer},</p>
          <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 24px;">
            <strong style="color:#111827;">${safeReferred}</strong> joined through your referral link for <strong style="color:#111827;">${safeCampaign}</strong>.
          </p>
          <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:24px;text-align:center;margin:20px 0 28px;">
            <p style="color:#6b7280;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Your Reward</p>
            <p style="color:#d97706;font-size:32px;font-weight:800;margin:0 0 12px;letter-spacing:-1px;">${referrerReward}</p>
            <div style="background:#ffffff;border:2px dashed #fcd34d;border-radius:8px;padding:10px 24px;display:inline-block;">
              <p style="font-family:monospace;font-size:20px;font-weight:700;color:#d97706;margin:0;letter-spacing:3px;">${referrerCode}</p>
            </div>
            <p style="color:#6b7280;font-size:13px;margin:12px 0 0;">Save this code to redeem your reward</p>
          </div>
          <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0;text-align:center;">Keep sharing your referral link to earn more rewards!</p>
        `)}
      `),
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map