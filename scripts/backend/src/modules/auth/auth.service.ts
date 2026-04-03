import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  create(data: any, tenantId?: string) {
    return { success: true, tenantId, data };
  }

  findAll(tenantId?: string) {
    return [{ message: 'Stub list for auth', tenantId }];
  }
}
