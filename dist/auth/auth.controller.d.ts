import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        business: {
            id: string;
            email: string;
            name: string;
            plan: string;
            subscriptionStatus: string;
            avatarUrl: string | null;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        business: {
            id: string;
            email: string;
            name: string;
            plan: string;
            subscriptionStatus: string;
            avatarUrl: string | null;
        };
    }>;
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
        business: {
            id: string;
            email: string;
            name: string;
            plan: string;
            subscriptionStatus: string;
            avatarUrl: string | null;
        };
    }>;
    getProfile(businessId: string): Promise<{
        name: string;
        email: string;
        id: string;
        plan: string;
        subscriptionStatus: string;
        planUpdatedAt: Date | null;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
    uploadAvatar(businessId: string, file: Express.Multer.File): Promise<{
        avatarUrl: string;
    }>;
}
