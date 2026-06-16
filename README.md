# ⚡ ShipKit - SaaS Boilerplate Starter Kit

```text
  ██████╗██╗  ██╗██╗██████╗ ██╗  ██╗██╗████████╗
  ██╔════╝██║  ██║██║██╔══██╗██║ ██╔╝██║╚══██╔══╝
  ███████╗███████║██║██████╔╝█████╔╝ ██║   ██║   
  ╚════██║██╔══██║██║██╔═══╝ ██╔═██╗ ██║   ██║   
  ███████║██║  ██║██║██║     ██║  ██╗██║   ██║   
  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝  ╚═╝╚═╝   ╚═╝   
```

**The Ultimate SaaS Boilerplate & Developer Starter Kit**  
*Launch your startup or SaaS in hours instead of weeks. High-performance React (Vite) + Node.js (Express) + SQLite (better-sqlite3) stack with secure JWT authentication, multi-tier Stripe subscription billing, an advanced administrative analytics dashboard, and integrated SMTP transaction mailers.*

---

## 🛠️ Tech Stack Badges

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Stripe](https://img.shields.io/badge/Stripe-008FDF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-224488?style=for-the-badge&logo=nodemailer&logoColor=white)](https://nodemailer.com/)

---

## 🛰️ Architecture Diagram

ShipKit employs a high-performance single-origin architecture. The Express backend serves as the core API coordinator and, when built for production, compiles and hosts the Vite React Single Page Application (SPA) directly from `/client/dist`, facilitating simple deployment with zero CORS configurations.

```text
                                 +---------------------------------+
                                 |         Client (Browser)        |
                                 +---------------------------------+
                                                  |
                                    HTTPS Requests|   (Port 3000)
                                                  v
                                 +---------------------------------+
                                 |         Vite + Express          |
                                 |       Unified Web Server        |
                                 +---------------------------------+
                                      |                       |
                  API routes (/api/*) |                       | Served Static Build
                                      v                       v (dist/*)
                       +----------------------+    +-----------------------+
                       |  Express API Router  |    |  React Frontend SPA   |
                       +----------------------+    +-----------------------+
                            |            |
                            |            +-----------------------+
              SQL Queries   |                                    | System Notifications
              (Synchronous) |                                    v
                            v                           +------------------+
                     +-------------+                    | SMTP Mail Server |
                     | SQLite DB   |                    | (Nodemailer Core)|
                     | (db.sqlite) |                    +------------------+
                     +-------------+                             |
                            ^                                    | Dispatches Emails
                            | Live Webhooks                      v
                            | (Stripe Signatures Verified)  +----------+
                            +-------------------------------+  Stripe  |
                                                            | Platform |
                                                            +----------+
```

---

## 🔑 Demo Accounts Info

For quick exploration and immediate out-of-the-box evaluation, the database comes pre-seeded with two default, fully configured demo profiles:

| Account Type | Email Address | Password | Privileges / Views Accessible |
|---|---|---|---|
| **Regular User** | `user@shipkit.dev` | `password123` | Core User App Dashboard, Profile settings, Stripe purchase checkout flow. |
| **Administrator** | `admin@shipkit.dev` | `password123` | Full Admin Console access, real-time Recharts analytics, user management, global settings, SMTP mail diagnostics. |

*These accounts are automatically seeded into your SQLite database (`db.sqlite`) upon first system boot!*

---

## 💎 Full Feature List

### 🔒 1. Production-Grade JWT Authentication Suite
*   **Secure Storage**: JWT access and refresh tokens stored safely in secure, HTTP-only, `SameSite=Lax` cookie wrappers (fully proofed against CSRF and XSS attacks).
*   **Standard Flows**: Signup, login, logout, and token refresh loops.
*   **Verification Protocols**: Double-loop email verification with signed, expiring hash links.
*   **Self-Service Recovery**: Safe, password-reset mail handlers using secure system-salted temporary hashes.
*   **Route Protection**: Robust custom Express middleware for authorization, protecting both React routes and Node endpoints.

### 💳 2. Comprehensive Stripe Subscription Integration
*   **Interactive Tiers**: Pre-configured tiers (Starter Monthly and Pro Yearly) mapped to your database.
*   **Embedded Billing Portal**: Integrated Stripe Customer Portal for secure customer self-service (card updates, invoice history, subscription cancellations).
*   **Secure Webhook Receiver**: Sign-verified Stripe Webhooks route (`/api/payments/webhook`) supporting instant state syncing on `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
*   **Zero-Config Simulation Fallback**: Built-in simulator mode. If Stripe keys are omitted, the boilerplate operates in Simulation Mode, giving developers a full mockup buy-flow (including instant database state syncs) with no Stripe account needed!

### 📊 3. Administrative Control Center (Admin Panel)
*   **Analytics Overview**: Aggregate metrics representing Total Customers, Active Subscriptions, and live Monthly Recurring Revenue (MRR).
*   **Signup Graphing**: Interactive area charts rendering daily signup trends using responsive **Recharts** packages.
*   **User Directory CRUD**: Complete database explorer with pagination, regex user search, system-role filters, role editing (user to admin updates), and customer deletion.
*   **Lock-Safe Deletion Guard**: Built-in server safeguards to prevent administrators from accidentally deleting their own currently logged-in account.
*   **System Controls**: Dynamic global control values (App name, support email, maintenance mode) stored and fetched dynamically from SQLite.

### ✉️ 4. Transactional Mail Core (SMTP Engine)
*   **Modular Architecture**: Isolated Nodemailer module (`server/utils/email.js`) that safely boots simulated logs in development and uses high-volume SMTP relays in production.
*   **Responsive Templates**: Clean HTML email layouts for Welcomes, Verification Codes, and Billing Confirmations.
*   **Admin Diagnostic Test Portal**: Integrated system diagnostics button on the Admin tab that tests live SMTP configurations by sending a diagnostic report email to the active admin.

### 🎨 5. Conversion-Optimized Marketing Page
*   **Hero Sections**: Catchy typography and layout engineered for modern software sales.
*   **Features Grid**: Fully custom icon-set cards demonstrating your product features.
*   **FAQ Accordeon**: Fully reactive, animated component displaying frequently asked questions.
*   **Tier Selector**: Dynamic pricing layout showing savings for annual billing with instant register CTA routing.

---

## 📷 Screenshots & Interface Tour

*(Since this codebase is downloaded as clean, high-performance source files, the following text logs illustrate the responsive interface built for your users)*

### 1. The Marketing Landing Page
*   **Visual Structure**: Centered hero tagline with a modern brand badge and direct call-to-action buttons. Features a dual-card grid presenting security and performance traits.
*   **Interactive Pricing Grid**: Side-by-side cards highlighting the 'Pro Yearly' plan with a "Popular" badge and an explicit calculation of the discount compared to the monthly plan. Clicking plans routes users to `/signup?plan=X` to streamline conversion.

### 2. User App Dashboard
*   **Visual Structure**: Modern two-column workspace. The left column shows subscription states ("Active: Starter Monthly" or "No Premium Plan"). The right column hosts the profile configuration module where users can update name, email, or reset their password.
*   **Billing Grid**: If un-subscribed, a sleek multi-plan pricing interface appears, letting users launch the Stripe Checkout flow (or Simulation Mode) directly from their workspace.

### 3. Administrative Analytics Console
*   **Visual Structure**: 4 key-metric cards spanning the top of the interface: Total Registered, Monthly Recurring Revenue, Active Subscriptions, and Estimated Lifetime Value.
*   **Live Charts**: A beautiful, fluid area chart tracking daily signup growth over the last 7 days.
*   **User Ledger**: A structured HTML table showing user names, email status (Verified or Unverified), active subscription status, and action buttons to modify profiles or remove accounts.

---

## ⚙️ Environment Variables Reference

Your application is configured using key-value settings parsed dynamically from your local `.env` file at server startup.

### General Server
*   `PORT`: The primary listening network port for the unified Express server. (Default: `3001` in dev, bound to `3000` or custom variable in production).
*   `NODE_ENV`: Operational environment toggle. Set to `development` for hot-reloading logs, or `production` to bundle client assets and enforce secure cookie rules.
*   `CLIENT_URL`: The fully qualified origin URL of your client SPA app (e.g. `http://localhost:3000`). Used for resolving CORS origins in development.

### Database Configuration
*   `DATABASE_PATH`: Relative or absolute path where the SQLite storage file will be read/written (Default: `db.sqlite`).

### Authentication & Token Security
*   `JWT_SECRET`: Cryptographic signing phrase used to secure session tokens. **Must be updated to a unique, randomized 64-character hash in production.**
*   `JWT_EXPIRES_IN`: Session cookie TTL duration offset (e.g. `7d` representing 7 calendar days).

### Stripe API Integrations
*   `STRIPE_SECRET_KEY`: Private API Secret key obtained from your Stripe Dashboard (Developers > API Keys). Used to authenticate API calls.
*   `STRIPE_WEBHOOK_SECRET`: Cryptographic signature verifying key. Received during webhook webhook endpoint configuration to confirm request legitimacy.
*   `STRIPE_PRICE_ID_MONTHLY`: Price ID generated in Stripe Product catalog for the Starter Monthly Plan tier.
*   `STRIPE_PRICE_ID_YEARLY`: Price ID generated in Stripe Product catalog for the Pro Yearly Plan tier.

### SMTP Mail Relay Configurations
*   `SMTP_HOST`: Fully qualified address of your outbound SMTP relay service (e.g. `smtp.mailtrap.io`, `smtp.resend.com`, `smtp.sendgrid.net`).
*   `SMTP_PORT`: Relay service connection port (typically `587` for TLS / STARTTLS or `465` for secure SSL).
*   `SMTP_USER`: Authed service login username.
*   `SMTP_PASS`: Authed service secret password.
*   `FROM_EMAIL`: Friendly sender description header (e.g. `ShipKit <noreply@yourdomain.com>`).

---

## ⏱️ 2-Minute Quick Start Guide

Getting ShipKit running locally is exceptionally simple.

### 1. Install All Dependencies
Run this unified script from the root workspace directory:
```bash
npm run install:all
```
This automatically boots and executes concurrent library installations across the monorepo root, backend api, and frontend client.

### 2. Setup Environment Variables
Clone the pre-configured environment template:
```bash
cp .env.example .env
```
Open `.env` and fill in your custom application settings.

### 3. Run Development Servers
Start client-side hot-reloading (Vite) and backend api listening concurrently:
```bash
npm run dev
```
*   **Frontend SPA App**: http://localhost:3000
*   **Backend Node API**: http://localhost:5000 (proxied via Vite on `/api`)

### 4. Boot & Explore Demo Accounts
Open your browser and navigate to http://localhost:3000:
*   Click **Login** and type `admin@shipkit.dev` with password `password123` to instantly access the fully populated, high-performance Administration Dashboard!
*   Type `user@shipkit.dev` with password `password123` to test the standard user billing subscription purchasing checkout funnel!

---

## 🧭 API Endpoints Reference

| Category | Route | Method | Description | Access |
|---|---|---|---|---|
| **Auth** | `/api/auth/signup` | `POST` | Registers a new user account | Public |
| **Auth** | `/api/auth/login` | `POST` | Validates credentials & yields JWT cookie | Public |
| **Auth** | `/api/auth/logout` | `POST` | Invalidates JWT and clears session cookie | Public |
| **Auth** | `/api/auth/verify-email`| `POST` | Verifies account using encrypted token | Public |
| **Auth** | `/api/auth/forgot-password`| `POST` | Dispatches recovery password reset link | Public |
| **Auth** | `/api/auth/reset-password`| `POST` | Updates password with secure reset key | Public |
| **User** | `/api/users/profile` | `GET` | Fetches authenticated user's profile | Private |
| **User** | `/api/users/profile` | `PUT` | Updates name, email, and security variables | Private |
| **Billing** | `/api/payments/subscription`| `GET` | Gets active plan name & metadata | Private |
| **Billing** | `/api/payments/create-checkout`| `POST`| Generates a secure Stripe Checkout link | Private |
| **Billing** | `/api/payments/create-portal`| `POST` | Generates self-service Stripe billing portal| Private |
| **Billing** | `/api/payments/webhook` | `POST` | Processes verified events from Stripe | Hook-Only|
| **Admin** | `/api/admin/stats` | `GET` | Aggregates system metrics & charts | Admin-Only|
| **Admin** | `/api/admin/users` | `GET` | Lists paginated, searchable database users | Admin-Only|
| **Admin** | `/api/admin/users/:id` | `PUT` | Overrides user email, verification, and role | Admin-Only|
| **Admin** | `/api/admin/users/:id` | `DELETE`| Destructively deletes a user account | Admin-Only|
| **Admin** | `/api/admin/settings` | `GET` | Fetches global site settings configurations | Admin-Only|
| **Admin** | `/api/admin/settings` | `PUT` | Saves global site settings parameters | Admin-Only|
| **Admin** | `/api/admin/test-email` | `GET` | Triggers a diagnostic test SMTP email | Admin-Only|

---

## 🚀 Deployment Guide

### Option 1: Monolithic Production Setup (Recommended)
Because Express serves the compiled React dist bundle dynamically under `NODE_ENV=production`, you can host ShipKit on any server running Node.js (Vercel, Render, Railway, Fly.io, or any basic VPS like DigitalOcean).

1.  Compile your static React bundle inside the root:
    ```bash
    npm run build
    ```
2.  Launch the Express web server bound to port 3000:
    ```bash
    NODE_ENV=production PORT=3000 npm run start
    ```

### Option 2: Deploying to Railway / Render (Zero-Downtime PaaS)
1.  Connect your GitHub repository containing the compiled code.
2.  Set the following environment parameters under the service Dashboard settings:
    *   `NODE_ENV`: `production`
    *   `PORT`: `3000`
    *   `JWT_SECRET`: *(A random 64-character hash string)*
3.  Deploy! Railway or Render will read the root `package.json`, install, build, and deploy the single unified listening instance perfectly on port 3000.

---

## 📄 License & Commercial Rights

Licensed under the **MIT License**.  
*Permission is hereby granted to copy, edit, compile, modify, publish, and deploy unlimited commercial SaaS instances utilizing ShipKit. No attribution required.*

---

## 🛒 Buy ShipKit

Ready to launch? Get instant access to the full source code:

| License | Price | What You Get |
|---------|-------|-------------|
| **Single License** | **$69** | One project. Full source, docs, and updates. |
| **Extended License** | **$169** | Unlimited projects. Commercial use, priority support. |

👉 [**Buy Single License — $69**](https://buy.stripe.com/bJeaEZ89h6TscLVfAS33W00)
👉 [**Buy Extended License — $169**](https://buy.stripe.com/6oU4gB4X5elU13d60i33W01)

---

Crafted with ⚡ and passion by **ShipKit**. Happy hacking!
