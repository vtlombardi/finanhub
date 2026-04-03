const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'backend/src/modules');
const modules = ['auth', 'users', 'tenants', 'companies', 'ads', 'categories'];

const toPascal = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const toSingular = (str) => str.endsWith('ies') ? str.slice(0, -3) + 'y' : str.endsWith('s') && str !== 'ads' ? str.slice(0, -1) : str;
const toSingularPascal = (str) => toPascal(toSingular(str));

modules.forEach(mod => {
    const modDir = path.join(modulesDir, mod);
    const dtoDir = path.join(modDir, 'dto');
    
    fs.mkdirSync(dtoDir, { recursive: true });

    const className = toSingularPascal(mod);
    const moduleName = toPascal(mod);

    // Module
    fs.writeFileSync(path.join(modDir, `${mod}.module.ts`), 
`import { Module } from '@nestjs/common';
import { ${moduleName}Controller } from './${mod}.controller';
import { ${moduleName}Service } from './${mod}.service';

@Module({
  controllers: [${moduleName}Controller],
  providers: [${moduleName}Service],
  exports: [${moduleName}Service]
})
export class ${moduleName}Module {}
`);

    // Controller
    fs.writeFileSync(path.join(modDir, `${mod}.controller.ts`), 
`import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ${moduleName}Service } from './${mod}.service';
import { Create${className}Dto } from './dto/create-${toSingular(mod)}.dto';

@Controller('api/v1/${mod}')
export class ${moduleName}Controller {
  constructor(private readonly service: ${moduleName}Service) {}

  @Post()
  create(@Body() createDto: Create${className}Dto, @Request() req: any) {
    const tenantId = req.user?.tenantId; // Proteção multi-tenant via Request
    return this.service.create(createDto, tenantId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user?.tenantId);
  }
}
`);

    // Service
    fs.writeFileSync(path.join(modDir, `${mod}.service.ts`), 
`import { Injectable } from '@nestjs/common';

@Injectable()
export class ${moduleName}Service {
  create(data: any, tenantId?: string) {
    return { success: true, tenantId, data };
  }

  findAll(tenantId?: string) {
    return [{ message: 'Stub list for ${mod}', tenantId }];
  }
}
`);

    // DTO
    fs.writeFileSync(path.join(dtoDir, `create-${toSingular(mod)}.dto.ts`), 
`export class Create${className}Dto {
  // TODO: Adicionar campos com @IsString(), @IsNotEmpty() via class-validator
}
`);

});

// Preparo de Autenticacão e Guards B2B Multi-tenant
const authSharedDir = path.join(__dirname, 'backend/src/shared/guards');
fs.mkdirSync(authSharedDir, { recursive: true });

fs.writeFileSync(path.join(authSharedDir, 'jwt-auth.guard.ts'),
`import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * FINANHUB - Guard de Autenticação Enterprise
 * Valida não só a expiração do token, mas garante que a requisição
 * injete o 'tenantId' globalmente no contexto da API REST.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Stub: Validação JWT Real virá com @nestjs/passport
    const token = request.headers.authorization;
    if (!token) throw new UnauthorizedException('Missing FINANHUB Bearer Token');
    
    // Simulação da Assinatura e Extração do Payload (Tenant / User)
    request.user = { id: 'mock-uuid', tenantId: 'tenant-123', role: 'ADMIN' };
    return true;
  }
}
`);

console.log("Modules generated successfully!");
