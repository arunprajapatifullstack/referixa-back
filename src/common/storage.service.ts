import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private s3Client: any = null;
  private useS3 = false;

  constructor(private config: ConfigService) {
    const region = this.config.get<string>('S3_REGION');
    const accessKey = this.config.get<string>('S3_ACCESS_KEY');
    const secretKey = this.config.get<string>('S3_SECRET_KEY');
    const bucket = this.config.get<string>('S3_BUCKET');

    if (region && accessKey && secretKey && bucket) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { S3Client } = require('@aws-sdk/client-s3');
        this.s3Client = new S3Client({ region, credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } });
        this.useS3 = true;
      } catch {
        console.warn('S3 client unavailable, falling back to local storage');
      }
    }
  }

  getBucket(): string {
    return this.config.get<string>('S3_BUCKET') || '';
  }

  isS3Enabled(): boolean {
    return this.useS3;
  }

  async uploadFile(key: string, buffer: Buffer, mimetype: string): Promise<string> {
    if (this.useS3 && this.s3Client) {
      const { PutObjectCommand } = require('@aws-sdk/client-s3');
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.getBucket(),
          Key: key,
          Body: buffer,
          ContentType: mimetype,
        }),
      );
      return `https://${this.getBucket()}.s3.${this.config.get<string>('S3_REGION')}.amazonaws.com/${key}`;
    }
    return '';
  }

  async deleteFile(key: string): Promise<void> {
    if (this.useS3 && this.s3Client) {
      const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.getBucket(), Key: key }));
    }
  }
}
