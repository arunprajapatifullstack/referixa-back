import { Controller, Post, Get, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { readFileSync, unlinkSync } from 'fs';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BusinessId } from '../common/decorators/business.decorator';

const IMAGE_MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

function validateMagicBytes(filepath: string, mimetype: string): boolean {
  try {
    const magic = IMAGE_MAGIC_BYTES[mimetype];
    if (!magic) return false;
    const buf = readFileSync(filepath).subarray(0, magic.length);
    return magic.every((b, i) => buf[i] === b);
  } catch {
    return false;
  }
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new business account' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @ApiOperation({ summary: 'Sign in with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current business profile' })
  getProfile(@BusinessId() businessId: string) {
    return this.authService.getProfile(businessId);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload business avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: join(__dirname, '..', '..', 'uploads', 'avatars'),
      filename: (req, file, cb) => {
        const businessId = (req as any).user?.sub || 'unknown';
        const ext = extname(file.originalname);
        const safeName = `${businessId}-${Date.now()}${ext}`.replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, safeName);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowed.includes(file.mimetype)) {
        cb(new BadRequestException('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadAvatar(
    @BusinessId() businessId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const filepath = join(__dirname, '..', '..', 'uploads', 'avatars', file.filename);
    if (!validateMagicBytes(filepath, file.mimetype)) {
      try { unlinkSync(filepath); } catch {}
      throw new BadRequestException('File content does not match the declared image type');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    await this.authService.updateAvatar(businessId, avatarUrl);
    return { avatarUrl };
  }
}
