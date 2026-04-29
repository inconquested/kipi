# KIPI // INVENTORY MANAGEMENT SYSTEM

A brutalist, high-contrast inventory tracking and management system designed with the **"Anti-gravity"** aesthetic. Built for efficiency, transparency, and precision.

## // OVERVIEW

KIPI is a full-stack web application designed to manage physical assets within an organization. It balances a rigid, sharp-cornered design language with advanced features like QR code tracking, real-time status monitoring, and automated approval workflows.

## // TECH STACK

- **CORE:** [Next.js 15+](https://nextjs.org/) (App Router)
- **AUTH:** [Better Auth](https://better-auth.com/)
- **DATABASE:** [Prisma ORM](https://prisma.io/) (SQLite/PostgreSQL)
- **STYLING:** [Tailwind CSS](https://tailwindcss.com/)
- **UI COMPONENTS:** [Shadcn UI](https://ui.shadcn.com/)
- **ICONS:** [Lucide React](https://lucide.dev/)
- **ALERTS:** [Sonner](https://sonner.stevenly.me/)

## // KEY FEATURES

- **[ DASHBOARD ]** // Real-time analytics for inventory health and pending requests.
- **[ INVENTORY MGMT ]** // Granular control over items, categories, and stock levels.
- **[ QR SYSTEM ]** // Automatic QR code generation for every registered item.
- **[ APPROVAL QUEUE ]** // Structured workflow for item borrowing and returns.
- **[ BREADCRUMBS ]** // Dynamic, brutalist navigation across the entire app.
- **[ LOCALIZATION ]** // Fully localized in Bahasa Indonesia.

## // GETTING STARTED

### 1. CLONE THE REPOSITORY
```bash
git clone https://github.com/inconquested/kipi.git
cd kipi
```

### 2. INSTALL DEPENDENCIES
```bash
bun install
# or
npm install
```

### 3. CONFIGURE ENVIRONMENT
Create a `.env` file and set up your database and auth secrets.

### 4. DATABASE INITIALIZATION
```bash
bunx prisma generate
bunx prisma db push
bunx prisma db seed
```

### 5. RUN DEVELOPMENT SERVER
```bash
bun dev
```

## // LICENSE

DISTRIBUTED UNDER THE **MIT LICENSE**.

---

**// KIPI SYSTEM // VER 1.0.0**
