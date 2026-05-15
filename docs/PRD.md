# Product Requirements Document: Lead Magnet Roulette

## Problem Statement

The user needs a high-converting, self-hostable Lead Magnet to capture customer information (Email, Name, Phone) in exchange for an interactive game experience (Roulette). The current process lacks a fun, engaging way to collect leads while ensuring GDPR compliance and prize inventory management.

## Solution

A Next.js-based online Roulette application where visitors are "gated" by a lead capture form. After providing a mandatory Email and explicit Consent, users can spin a visually premium wheel to win a Prize. The system handles the weighted probability of wins, manages stock levels, delivers prizes via Gmail SMTP, and provides an Admin dashboard for configuration and Lead management.

## User Stories

1. As a visitor, I want to see a visually appealing Roulette wheel, so that I am motivated to participate.
2. As a visitor, I want to enter my Email to spin the wheel, so that I can win a prize.
3. As a visitor, I want the option to provide my Name and Phone, so that I can receive more personalized communication.
4. As a visitor, I want to see a GDPR consent checkbox, so that I know my data is being handled legally.
5. As a visitor, I want to see a "No Prize" result and be able to try again immediately, so that I stay engaged.
6. As a winner, I want to see my prize code instantly on screen, so that I can use it immediately.
7. As a winner, I want to receive my prize via email, so that I have a record of it.
8. As an Admin, I want to log in securely using simple credentials, so that I can manage the application.
9. As an Admin, I want to add, edit, or delete Prizes, so that I can control the rewards offered.
10. As an Admin, I want to set Probability Weights for each prize, so that I can control the payout frequency.
11. As an Admin, I want to set Stock limits for prizes, so that I don't give away more than I have in inventory.
12. As an Admin, I want to view a list of all Leads captured, so that I can track the performance of the campaign.
13. As an Admin, I want to export Leads to CSV/Excel, so that I can import them into my CRM or marketing tools.
14. As an Admin, I want to configure the Data Retention period (e.g., 90 days), so that I comply with GDPR storage limitations.
15. As an Admin, I want to customize the "Light Premium" theme colors, so that it aligns with my brand identity.

## Implementation Decisions

- **Framework & Stack**: Next.js (App Router), Tailwind CSS, PostgreSQL, Prisma, and Zod for validation.
- **Roulette Engine**: A server-side module that determines the winning segment *before* the animation begins, using a weighted random algorithm that respects stock limits.
- **Admin Dashboard**: A protected area using NextAuth.js, allowing for future Role-Based Access Control (RBAC).
- **Email Delivery**: Integrated Gmail SMTP for sending prize notifications with generic codes.
- **Data Retention**: A daily cron-like background job to automatically purge Leads older than the configured threshold.
- **GDPR Compliance**: Mandatory "Consent" checkbox and clear data handling policies.
- **Deployment**: Containerized setup ready for Dokploy self-hosting.

## Testing Decisions

- **Roulette Engine Tests**: Unit tests will verify the weighted probability distribution and ensure stock is decremented atomically.
- **Lead Capture Integration Tests**: Tests will ensure that data is stored correctly, consent is recorded, and the "No Prize" re-spin logic works as expected.
- **Style Consistency**: We will use a "Light Premium" design system that is configurable via CSS variables or a settings table.

## Out of Scope

- Third-party CRM direct integrations (CSV export is the primary data portability tool).
- SMS prize delivery (Email delivery only).
- Advanced analytics or A/B testing of wheel designs.

## Further Notes

- Gmail requires an "App Password" to be used as an SMTP provider.
- "No Prize" segments (1-2 on the wheel) will allow for an immediate re-spin without requiring a new lead entry.
