# ADR 0001: Technology Stack Selection

## Status
Accepted (Updated: MongoDB Migration)

## Context
We need a robust, modern, and self-hostable technology stack for the Lead Magnet Roulette project. The application must handle interactive frontend animations, data capture, and storage, and be deployable via Dokploy.

## Decision
We will use the following technology stack:
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **ORM**: Prisma
- **Validation**: Zod

## Rationale
- **Next.js** provides a seamless developer experience for both UI and API logic, which is ideal for a single-purpose application like a lead magnet.
- **Tailwind CSS** allows for rapid UI development and high-performance animations required for the roulette.
- **MongoDB** is a flexible, document-oriented database that integrates perfectly with Node.js applications and Dokploy's managed database features. It provides excellent scalability for lead capture scenarios.
- **Prisma** offers type-safe database access, reducing runtime errors and improving development speed. The MongoDB adapter simplifies schema management.
- **Zod** ensures data integrity at the edge (form submission).

## Consequences
- Requires a Node.js runtime for deployment.
- MongoDB provides automatic schema flexibility without explicit migrations (though Prisma manages the schema).
- Dokploy must be configured to host both the Next.js app (Dockerized) and the MongoDB instance.
- No need for complex database migration tools; Prisma handles schema validation.
- Better support for document-based data structures and embedded relationships.

## MongoDB-Specific Considerations
- Document IDs use MongoDB ObjectId (`@db.ObjectId`).
- Relations are embedded within documents for better performance on frequently-accessed relationships.
- Indexes are automatically created by Prisma for optimized queries.
- Backup and restore strategies should leverage MongoDB's built-in replication features.
