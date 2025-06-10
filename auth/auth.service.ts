import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "users/users.service";
import * as bcrypt from 'bcrypt';
import { use } from "passport";

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) {}

    async signup(email: string, password: string) {
        const userExists = await this.userService.findByEmail(email);
        if (userExists) throw new ForbiddenException("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userService.createUser(email, hashedPassword);

        return this.generateTokens(user._id as string, user.email);
    }

    async login(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) throw new ForbiddenException("Invalid credentials");

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new ForbiddenException("Invalid credentials");

        return this.generateTokens(user._id as string, user.email);
    }

    async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email};

        const [accessToken, refreshToken] = await Promise.all([
          this.jwtService.signAsync(payload, {
            secret: this.config.get('jwt.accessSecret'),
            expiresIn: this.config.get('jwt.accessTokenExpiresIn'),
          }),
          this.jwtService.signAsync(payload, {
            secret: this.config.get('jwt.refreshSecret'),
            expiresIn: this.config.get('jwt.refreshTokenExpiresIn'),
          }),
        ]);

        return { accessToken, refreshToken };
    }
}