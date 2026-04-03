import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  create(data: any, tenantId?: string) {
    return { success: true, tenantId, data };
  }

  findAll(tenantId?: string) {
    return [{ message: 'Stub list for categories', tenantId }];
  }
}
