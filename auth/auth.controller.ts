// src/auth/auth.controller.ts

import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto.email, dto.password);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @Post('refresh')
  async refresh(@GetUser() user: any) {
    return this.authService.generateTokens(user.sub, user.email);
  }
}
