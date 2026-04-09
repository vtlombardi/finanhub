import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('dashboard/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Roles('OWNER', 'ADMIN')
  async getLogs(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId: req.user.tenantId },
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.auditLog.count({ where: { tenantId: req.user.tenantId } }),
    ]);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }
}
