# ReviewBoost AI

ReviewBoost AI is a compliance-safe SaaS review management platform for hotels, restaurants, cafes, salons, clinics and local businesses.

## What is included

- Public marketing website: Home, Features, Pricing, Demo, Contact, Login, Register
- Public guest QR review pages:
  - `/r/[businessSlug]`
  - `/r/[businessSlug]/[locationSlug]`
  - `/r/[businessSlug]/room/[roomNo]`
  - `/r/[businessSlug]/table/[tableNo]`
- Admin dashboard with review inbox, manual AI reply generator, QR management, complaint tickets and business settings
- Super admin dashboard with business, subscription and usage views
- Prisma schema for all requested core models
- NextAuth credentials provider with JWT sessions, plus role-aware middleware for admin surfaces
- OpenAI service functions with compliance prompts and fallback generation
- Google Business Profile OAuth, token refresh, account/location selection, review sync and admin-approved reply posting routes
- Manual OTA/Food app review reply workflow
- Tesseract.js OCR API route for review screenshots
- Dynamic QR generation
- Seed data for demo accounts and a demo hotel

## Compliance rules

The app is intentionally designed to avoid unsafe review behavior:

- No fake reviews
- No guest review auto-posting
- No incentive-based reviews
- No review gating
- Negative users are not blocked from public platform links
- All guest ratings are stored honestly
- Google replies are generated as drafts and require admin approval/posting workflow
- Non-Google platforms use manual or semi-automated copy workflows unless official API access exists

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Create a PostgreSQL database and set `DATABASE_URL`.

Example:

```env
DATABASE_URL="postgresql://postgres:password@db.example.supabase.co:5432/postgres?schema=public"
NEXTAUTH_SECRET="use-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google/callback"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Generate Prisma client and migrate:

```bash
npm run prisma:generate
npx prisma migrate dev --name init
```

5. Seed the initial super admin:

```bash
npx prisma db seed
```

6. Run locally:

```bash
npm run dev
```

## GitHub

This folder is ready to push to GitHub:

```bash
git init
git add .
git commit -m "Initial ReviewBoost AI app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

The repository includes:

- `.gitignore` for Node, Next.js, Vercel, logs and local environment files
- GitHub Actions CI at `.github/workflows/ci.yml`
- `npm ci`, Prisma client generation and `npm run build` validation on pushes and pull requests

## Vercel deployment

1. Push the project to GitHub.
2. In Vercel, click **Add New > Project** and import the GitHub repository.
3. Keep the framework preset as **Next.js**.
4. Add the required environment variables in **Project Settings > Environment Variables**.
5. Deploy.

The included `vercel.json` uses:

```bash
npm ci
npm run vercel-build
```

`vercel-build` runs `prisma generate` before `next build`, which is required for Prisma on Vercel.

For production, use PostgreSQL. Supabase is the recommended quick setup:

1. Create a Supabase project.
2. Copy the PostgreSQL connection string from Supabase.
3. Add the environment variables locally and in Vercel.
4. Run:

```bash
npx prisma migrate deploy
```

5. Run:

```bash
npx prisma db seed
```

### Vercel environment variables

Use production URLs in Vercel:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?schema=public"
NEXTAUTH_SECRET="use-a-long-random-secret"
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
JWT_SECRET="use-a-different-long-random-secret"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
OPENAI_API_KEY=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="https://your-vercel-domain.vercel.app/api/google/callback"
SMTP_HOST=""
SMTP_USER=""
SMTP_PASS=""
```

When Google login/review sync is enabled, add the same production callback URL to the Google Cloud OAuth client.

## Initial super admin

The seed script creates the first super admin account:

- Email: `superadmin@yashinfosystems.com`
- Temporary password: `Admin@123`
- Role: `SUPER_ADMIN`

Set a strong password after first login from the change-password page.

## Important environment variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
NEXT_PUBLIC_APP_URL=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

## Google integration notes

The Google module uses Google OAuth and Google Business Profile APIs:

- Admin UI: `/admin/integrations/google`
- OAuth start: `/api/google/connect`
- OAuth callback: `/api/google/callback`
- Accounts: `/api/google/accounts`
- Locations: `/api/google/locations`
- Review sync: `/api/google/reviews/sync`
- Generate reply: `/api/google/reviews/[reviewId]/generate-reply`
- Post approved reply: `/api/google/reviews/[reviewId]/post-reply`

### Google API setup

1. Create a Google Cloud project.
2. Enable the Google Business Profile APIs:
   - Business Profile Account Management API
   - Business Profile Business Information API
   - Business Profile APIs used for reviews.
3. Configure the OAuth consent screen.
4. Create an OAuth client ID.
5. Add redirect URI:

```text
http://localhost:3000/api/google/callback
```

6. Add env values:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google/callback"
```

7. Login as a business admin.
8. Open `/admin/integrations/google`.
9. Click **Connect Google Business Profile**.
10. Load accounts, select an account, load locations, and map a Google location.
11. Sync reviews.
12. Generate an AI reply.
13. Edit/approve and post the reply to Google.

Google access and refresh tokens are encrypted before storage in `PlatformConnection`. Replies are never auto-posted; `/api/google/reviews/[reviewId]/post-reply` requires an explicit admin final reply.

## Future-ready placeholders

- SMTP notification delivery
- WhatsApp Business API alerts
- S3-compatible file storage
- Google Vision OCR provider
- Payment provider
- Advanced reports and PDF exports
