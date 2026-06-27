import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private config;
    private s3Client;
    private useS3;
    constructor(config: ConfigService);
    getBucket(): string;
    isS3Enabled(): boolean;
    uploadFile(key: string, buffer: Buffer, mimetype: string): Promise<string>;
    deleteFile(key: string): Promise<void>;
}
