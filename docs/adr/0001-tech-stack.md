# ADR 0001: Technology Stack Selection

## Status
Accepted

## Context
We need a robust, modern, and self-hostable technology stack for the Lead Magnet Roulette project. The application must handle interactive frontend animations, data capture, and storage, and be deployable via Dokploy.

## Decision
We will use the following technology stack:
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod

## Rationale
- **Next.js** provides a seamless developer experience for both UI and API logic, which is ideal for a single-purpose application like a lead magnet.
- **Tailwind CSS** allows for rapid UI development and high-performance animations required for the roulette.
- **PostgreSQL** is a reliable, industry-standard database that integrates perfectly with Dokploy's managed database features.
- **Prisma** offers type-safe database access, reducing runtime errors and improving development speed.
- **Zod** ensures data integrity at the edge (form submission).

## Consequences
- Requires a Node.js runtime for deployment.
- Database migrations must be managed (Prisma handles this).
- Dokploy must be configured to host both the Next.js app (Dockerized) and the PostgreSQL instance.
