import { Injectable } from '@nestjs/common';

@Injectable()
export class CompaniesService {
  create(data: any, tenantId?: string) {
    return { success: true, tenantId, data };
  }

  findAll(tenantId?: string) {
    return [{ message: 'Stub list for companies', tenantId }];
  }
}
