import { Body, Controller, Post, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; pass: string }) {
    this.logger.log(`Login attempt: ${body.email}`);
    const user = await this.authService.validateUser(body.email, body.pass);
    if (!user) {
      this.logger.warn(`Failed login attempt for: ${body.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: { email: string; pass: string }) {
    this.logger.log(`New user registration: ${body.email}`);
    return this.authService.register(body.email, body.pass);
  }
}