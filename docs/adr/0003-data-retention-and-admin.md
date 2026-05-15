# ADR 0003: Data Retention and Administrative Access

## Status
Accepted

## Context
To comply with GDPR and manage the system efficiently, we need a clear policy for data storage and a secure way to manage the application's configuration.

## Decision
- **Configurable Retention Policy**: We will implement a background job (cron) that runs daily and deletes Leads older than the "Retention Period" defined in the admin settings.
- **Role-Based Ready Auth**: We will use NextAuth.js with a schema that supports a `Role` field (e.g., `ADMIN`, `MANAGER`) to allow for future expansion, even if we start with a single admin.
- **CSV/Excel Export**: We will implement server-side generation of CSV files for Lead data to allow easy integration with CRM or marketing tools.

## Rationale
- Automatic deletion is a key requirement for GDPR's "purpose limitation" and "storage limitation" principles.
- Preparing for roles early prevents major refactors later when the user needs to add team members.
- CSV export is the standard for data portability in lead generation.

## Consequences
- Requires a background task runner (e.g., a simple cron endpoint or a dedicated worker).
- The `Settings` table must store the `retention_days` value.
