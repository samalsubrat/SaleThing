# Prisma Documentation

## Overview

This project uses **Prisma ORM** with **PostgreSQL** as the database provider. The Prisma client is generated to `lib/generated/prisma`.

## Configuration

### Schema Location
- **Schema file**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations`
- **Generated client**: `lib/generated/prisma`

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

## Database Schema

### Models

#### User
Core user model for authentication.

| Field         | Type      | Attributes                  |
|---------------|-----------|------------------------------|
| id            | String    | @id @default(cuid())         |
| name          | String    |                              |
| email         | String    | @unique                      |
| emailVerified | Boolean   | @default(false)              |
| image         | String?   |                              |
| createdAt     | DateTime  | @default(now())              |
| updatedAt     | DateTime  | @updatedAt                   |

**Relations**: `sessions`, `accounts`, `sites`

#### Session
User authentication sessions.

| Field     | Type     | Attributes             |
|-----------|----------|------------------------|
| id        | String   | @id @default(cuid())   |
| userId    | String   | indexed                |
| token     | String   | @unique                |
| expiresAt | DateTime |                        |
| ipAddress | String?  |                        |
| userAgent | String?  |                        |
| createdAt | DateTime | @default(now())        |
| updatedAt | DateTime | @updatedAt             |

**Relations**: `user` (cascade delete)

#### Account
OAuth/credential accounts linked to users.

| Field        | Type      | Attributes             |
|--------------|-----------|------------------------|
| id           | String    | @id @default(cuid())   |
| userId       | String    | indexed                |
| accountId    | String    |                        |
| providerId   | String    |                        |
| accessToken  | String?   |                        |
| refreshToken | String?   |                        |
| expiresAt    | DateTime? |                        |
| password     | String?   |                        |
| createdAt    | DateTime  | @default(now())        |
| updatedAt    | DateTime  | @updatedAt             |

**Relations**: `user` (cascade delete)

#### Verification
Email/token verification records.

| Field      | Type     | Attributes             |
|------------|----------|------------------------|
| id         | String   | @id @default(cuid())   |
| identifier | String   |                        |
| value      | String   |                        |
| expiresAt  | DateTime |                        |
| createdAt  | DateTime | @default(now())        |
| updatedAt  | DateTime | @updatedAt             |

#### Site
Multi-tenant site configuration.

| Field        | Type     | Attributes             |
|--------------|----------|------------------------|
| id           | String   | @id @default(cuid())   |
| name         | String?  |                        |
| description  | String?  |                        |
| subdomain    | String?  | @unique                |
| customDomain | String?  | @unique                |
| logo         | String?  |                        |
| font         | String   | @default("inter")      |
| userId       | String?  | indexed                |
| createdAt    | DateTime | @default(now())        |
| updatedAt    | DateTime | @updatedAt             |

**Relations**: `user` (cascade delete), `pages`

#### Page
Site pages with JSON content.

| Field       | Type     | Attributes                      |
|-------------|----------|---------------------------------|
| id          | String   | @id @default(cuid())            |
| slug        | String   |                                 |
| siteId      | String   | indexed                         |
| published   | Boolean  | @default(false)                 |
| content     | Json?    | @default("[]")                  |
| title       | String?  |                                 |
| description | String?  |                                 |
| image       | String?  |                                 |
| visitCount  | Int      | @default(0)                     |
| createdAt   | DateTime | @default(now())                 |
| updatedAt   | DateTime | @updatedAt                      |

**Relations**: `site` (cascade delete)  
**Constraints**: `@@unique([siteId, slug])`

## CLI Commands

```bash
# Generate Prisma Client
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name <migration_name>

# Apply migrations (production)
pnpm prisma migrate deploy

# Reset database (development only)
pnpm prisma migrate reset

# Open Prisma Studio
pnpm prisma studio

# Push schema without migrations (prototyping)
pnpm prisma db push

# Format schema file
pnpm prisma format

# Validate schema
pnpm prisma validate
```

## Usage

### Importing the Client

```typescript
import { prisma } from "@/lib/prisma";
```

The client is instantiated as a singleton to prevent multiple connections in development (hot reload).

### Example Queries

```typescript
// Find user by email
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
  include: { sites: true }
});

// Create a site with pages
const site = await prisma.site.create({
  data: {
    name: "My Site",
    subdomain: "mysite",
    userId: user.id,
    pages: {
      create: {
        slug: "home",
        title: "Home Page",
        published: true
      }
    }
  }
});

// Find site by subdomain
const site = await prisma.site.findUnique({
  where: { subdomain: "mysite" },
  include: { pages: true }
});

// Update page content
await prisma.page.update({
  where: {
    siteId_slug: {
      siteId: site.id,
      slug: "home"
    }
  },
  data: {
    content: [{ type: "text", value: "Hello World" }]
  }
});
```

## Entity Relationship Diagram

```
User
 ├── Session (1:N)
 ├── Account (1:N)
 └── Site (1:N)
      └── Page (1:N)
```

## Notes

- All models use `cuid()` for ID generation
- Cascade deletes are configured on all child relations
- The `Page` model uses a composite unique constraint on `[siteId, slug]`
- JSON type is used for flexible page content storage
