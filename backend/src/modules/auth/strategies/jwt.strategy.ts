import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'jwt_secret_dev',
    });
  }

  async validate(payload: any) {
    // Injeta na request global os dados decriptados do B2B
    return { 
      userId: payload.sub, 
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role
    };
  }
}
