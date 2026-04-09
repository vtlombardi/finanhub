import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CryptoService } from './crypto.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    if (!user) return null;

    // Bloqueio de Segurança: Usuário deve estar verificado para logar
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('E-mail ainda não verificado. Por favor, confirme seu cadastro.');
    }

    if (await this.cryptoService.comparePassword(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }

  async refreshToken(user: any) {
    return this.login(user);
  }

  async registerUser(data: any) {
    try {
      const existing = await this.prisma.user.findFirst({
        where: { email: data.email },
      });

      if (existing) {
        throw new UnauthorizedException('E-mail já registrado.');
      }

      const hash = await this.cryptoService.hashPassword(data.password);

      // Geração do Código de Segurança (OTP) de 6 dígitos
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Código válido por 15 min

      const tenant = await this.prisma.tenant.create({
        data: {
          name: data.fullName || 'Nova Operação M&A',
          slug:
            ((data.fullName || 'empresa') as string)
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]+/g, '') +
            '-' +
            Date.now(),
        },
      });

      const newUser = await this.prisma.user.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          passwordHash: hash,
          tenantId: tenant.id,
          role: 'OWNER',
          isEmailVerified: false,
          verificationCode,
          verificationCodeExpires: expiresAt,
        },
      });

      // Disparo do E-mail Assíncrono
      await this.mailService.sendVerificationCode(newUser.email, verificationCode);

      return {
        id: newUser.id,
        email: newUser.email,
        message: 'Cadastro iniciado. Por favor, verifique seu e-mail para confirmar a operação.',
      };
    } catch (error) {
      console.error('REGISTER ERROR:', error);
      throw error;
    }
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) throw new BadRequestException('Usuário não encontrado.');
    if (user.isEmailVerified) throw new BadRequestException('E-mail já verificado.');

    if (user.verificationCode !== code) {
      throw new BadRequestException('Código de verificação inválido.');
    }

    if (!user.verificationCodeExpires || new Date() > user.verificationCodeExpires) {
      throw new BadRequestException('Código de verificação expirado.');
    }

    // Sucesso: Ativa o usuário e limpa o código
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    // Auto-login após verificação
    return this.login(user);
  }

  async acceptInvite(email: string, code: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });

    if (!user) throw new BadRequestException('Convite inválido.');
    if (user.isEmailVerified) throw new BadRequestException('Este convite já foi utilizado.');
    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
      throw new BadRequestException('Código de convite inválido.');
    }
    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('Convite expirado. Solicite um novo convite ao administrador do workspace.');
    }

    const passwordHash = await this.cryptoService.hashPassword(password);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        isEmailVerified: true,
        resetPasswordCode: null,
        resetPasswordExpires: null,
      },
    });

    return this.login(updatedUser);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });

    // Resposta genérica — não revela se o e-mail existe
    if (!user || !user.isEmailVerified) {
      return { message: 'Se este e-mail estiver cadastrado, você receberá um código em breve.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordCode: code, resetPasswordExpires: expiresAt },
    });

    await this.mailService.sendResetPasswordCode(user.email, code);

    return { message: 'Se este e-mail estiver cadastrado, você receberá um código em breve.' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });

    if (!user) throw new BadRequestException('Dados inválidos.');
    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
      throw new BadRequestException('Código inválido.');
    }
    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('Código expirado. Solicite um novo.');
    }

    const passwordHash = await this.cryptoService.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetPasswordCode: null, resetPasswordExpires: null },
    });

    return { message: 'Senha redefinida com sucesso. Faça login com sua nova senha.' };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) throw new BadRequestException('Usuário não encontrado.');
    if (user.isEmailVerified) throw new BadRequestException('E-mail já verificado.');

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: newCode,
        verificationCodeExpires: expiresAt,
      },
    });

    await this.mailService.sendVerificationCode(user.email, newCode);

    return { message: 'Novo código enviado para seu e-mail.' };
  }
}
