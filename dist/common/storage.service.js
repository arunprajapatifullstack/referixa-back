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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let StorageService = class StorageService {
    constructor(config) {
        this.config = config;
        this.s3Client = null;
        this.useS3 = false;
        const region = this.config.get('S3_REGION');
        const accessKey = this.config.get('S3_ACCESS_KEY');
        const secretKey = this.config.get('S3_SECRET_KEY');
        const bucket = this.config.get('S3_BUCKET');
        if (region && accessKey && secretKey && bucket) {
            try {
                const { S3Client } = require('@aws-sdk/client-s3');
                this.s3Client = new S3Client({ region, credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } });
                this.useS3 = true;
            }
            catch {
                console.warn('S3 client unavailable, falling back to local storage');
            }
        }
    }
    getBucket() {
        return this.config.get('S3_BUCKET') || '';
    }
    isS3Enabled() {
        return this.useS3;
    }
    async uploadFile(key, buffer, mimetype) {
        if (this.useS3 && this.s3Client) {
            const { PutObjectCommand } = require('@aws-sdk/client-s3');
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.getBucket(),
                Key: key,
                Body: buffer,
                ContentType: mimetype,
            }));
            return `https://${this.getBucket()}.s3.${this.config.get('S3_REGION')}.amazonaws.com/${key}`;
        }
        return '';
    }
    async deleteFile(key) {
        if (this.useS3 && this.s3Client) {
            const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
            await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.getBucket(), Key: key }));
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map