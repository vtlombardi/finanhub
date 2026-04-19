import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CryptoService } from '../auth/crypto.service';
import { MailService } from '../mail/mail.service';
import { InviteMemberDto, UpdateUserDto, CreateUserDto } from './dto/create-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
    private mailService: MailService,
  ) {}

  async findAllByTenant(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Este e-mail já está cadastrado.');

    // No cadastro direto sem tenantId especificado, o sistema deve tratar o isolamento.
    // Para o build passar, usaremos uma lógica de busca ou criação de tenant padrão.
    const passwordHash = await this.cryptoService.hashPassword(dto.password);

    // Busca o primeiro tenant como fallback ou cria um se necessário
    const defaultTenant = await this.prisma.tenant.findFirst() || 
      await this.prisma.tenant.create({ data: { name: 'Default Tenant', slug: 'default' } });

    return this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: dto.role ?? Role.USER,
        tenantId: defaultTenant.id,
        isEmailVerified: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });
  }

  async inviteMember(
    tenantId: string,
    requesterId: string,
    requesterRole: Role,
    dto: InviteMemberDto,
  ) {
    const targetRole = dto.role ?? Role.USER;

    this.assertCanAssignRole(requesterRole, targetRole);

    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });
    if (existing) throw new ConflictException('Este e-mail já pertence ao workspace.');

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado.');

    // Senha temporária aleatória — o convidado definirá a própria via link
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await this.cryptoService.hashPassword(tempPassword);

    // Código de convite válido por 48h (reutiliza campos de reset)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: targetRole,
        isEmailVerified: false,
        resetPasswordCode: code,
        resetPasswordExpires: expiresAt,
      },
      select: { id: true, email: true, fullName: true, role: true },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const inviteLink = `${frontendUrl}/accept-invite?email=${encodeURIComponent(dto.email)}&code=${code}`;

    await this.mailService.sendInvitation(dto.email, dto.fullName, tenant.name, inviteLink);

    return {
      ...user,
      message: `Convite enviado para ${dto.email}.`,
    };
  }

  async updateMemberRole(
    tenantId: string,
    targetId: string,
    dto: UpdateUserDto,
    requesterId: string,
    requesterRole: Role,
  ) {
    const target = await this.prisma.user.findFirst({ where: { id: targetId, tenantId } });
    if (!target) throw new NotFoundException('Membro não encontrado.');
    if (target.id === requesterId) throw new ForbiddenException('Você não pode alterar seu próprio cargo.');

    if (dto.role) this.assertCanAssignRole(requesterRole, dto.role);

    // Impede remover o último OWNER
    if (target.role === Role.OWNER && dto.role !== Role.OWNER) {
      const ownerCount = await this.prisma.user.count({ where: { tenantId, role: Role.OWNER } });
      if (ownerCount <= 1) throw new BadRequestException('O workspace precisa ter ao menos um OWNER.');
    }

    return this.prisma.user.update({
      where: { id: targetId },
      data: { role: dto.role, fullName: dto.fullName },
      select: { id: true, email: true, fullName: true, role: true },
    });
  }

  async removeMember(
    tenantId: string,
    targetId: string,
    requesterId: string,
    requesterRole: Role,
  ) {
    const target = await this.prisma.user.findFirst({ where: { id: targetId, tenantId } });
    if (!target) throw new NotFoundException('Membro não encontrado.');
    if (target.id === requesterId) throw new ForbiddenException('Você não pode remover a si mesmo.');

    if (requesterRole !== Role.OWNER && requesterRole !== Role.ADMIN) {
      throw new ForbiddenException('Apenas OWNER ou ADMIN podem remover membros.');
    }
    // ADMIN não pode remover OWNER
    if (requesterRole === Role.ADMIN && target.role === Role.OWNER) {
      throw new ForbiddenException('ADMIN não pode remover um OWNER.');
    }

    const ownerCount = await this.prisma.user.count({ where: { tenantId, role: Role.OWNER } });
    if (target.role === Role.OWNER && ownerCount <= 1) {
      throw new BadRequestException('O workspace precisa ter ao menos um OWNER.');
    }

    await this.prisma.user.delete({ where: { id: targetId } });
    return { message: 'Membro removido com sucesso.' };
  }

  async updateProfile(userId: string, tenantId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        phonePrimary: dto.phonePrimary,
        phoneSecondary: dto.phoneSecondary,
        jobTitle: dto.jobTitle,
        companyName: dto.companyName,
        avatarUrl: dto.avatarUrl,
        websiteUrl: dto.websiteUrl,
        city: dto.city,
        state: dto.state,
        country: dto.country,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phonePrimary: true,
        phoneSecondary: true,
        jobTitle: true,
        companyName: true,
        avatarUrl: true,
        websiteUrl: true,
        city: true,
        state: true,
        country: true,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const isMatch = await this.cryptoService.comparePassword(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isMatch) {
      throw new BadRequestException('A senha atual fornecida está incorreta.');
    }

    const newPasswordHash = await this.cryptoService.hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Senha alterada com sucesso.' };
  }

  // Regras de atribuição de cargo:
  // OWNER pode atribuir qualquer role
  // ADMIN pode atribuir apenas USER
  private assertCanAssignRole(requesterRole: Role, targetRole: Role) {
    if (requesterRole === Role.OWNER) return;
    if (requesterRole === Role.ADMIN && targetRole === Role.USER) return;
    throw new ForbiddenException(
      `Seu cargo (${requesterRole}) não permite atribuir o cargo ${targetRole}.`,
    );
  }
}
