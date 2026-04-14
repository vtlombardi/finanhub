# Technical Architecture

- **Frontend**: Next.js (App Router, Tailwind CSS, Lucide Icons).
- **Backend**: NestJS (Modular Architecture, Controllers, Services).
- **ORM**: Prisma for schema management and type safety.

## Database & Migrations Rules
- **Source of Truth**: `/backend/prisma/schema.prisma` is the only valid schema.
- **Migration Origin**: Run All migrations from the `/backend` directory.
- **Forbidden**: Never run `prisma migrate` or `db push` from `/DATABASE` root.
- **Data Integrity**: Critical fields (e.g., LeadStatus) must use strict Prisma ENUMs.
