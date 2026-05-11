# The Vision — Portfolio + Admin CMS

Monorepo for **Roua Bou Ghanem**'s portfolio: a creative public site and a separate admin panel that share one Postgres database.

```
roua/
├── apps/
│   ├── web/      Public portfolio (Next.js, port 3000)
│   └── admin/    Admin CMS (Next.js, port 3001)
└── packages/
    └── db/       Shared Prisma schema + client
```

The two apps deploy independently on Vercel, pointed at the same Neon database. The admin app builds pages from typed content blocks, supports drafts with live preview against the public site, and manages projects, services, media, and global settings — all in EN/FR.

---

## What's inside

### Public site (`apps/web`, port 3000)
- Bilingual EN/FR with localized slugs (`/en/about`, `/fr/a-propos`)
- Locale auto-detected from `Accept-Language` and remembered via cookie
- Dark + orange creative aesthetic with serif display type, grain overlay, scroll-triggered reveals, photo-frame hover, marquee
- Server-rendered pages built from DB content blocks (`Hero`, `Text`, `Image`, `Gallery`, `Projects`, `Services`, `FAQ`, `Contact`, `CTA`, `Marquee`, `Spacer`)
- `/preview/[id]?token=…` route to render drafts (admin iframes this)
- `app/sitemap.ts` and `app/robots.ts` generated from DB content
- AI crawlers explicitly allowed: `GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`
- JSON-LD: `Person`, `Organization`, `CreativeWork` per project, `FAQPage` per FAQ block, `BreadcrumbList`
- `hreflang` alternates on every page

### Admin panel (`apps/admin`, port 3001)
- JWT session auth, bcrypt password hashing, `/login` page
- Sidebar dashboard with: **Pages**, **Projects**, **Services**, **Media**, **Site settings**
- **Page editor** with three tabs (Content / SEO / Settings):
  - Block-based builder — add, reorder (↑/↓), edit, delete, with a structured editor per block type
  - Live preview pane that iframes the public `/preview/[id]` route with a locale toggle
  - Draft / Publish / Unpublish workflow
  - Per-locale meta title, description, keywords, OG image
- **Project editor**: bilingual fields, cover image, image list, tags, category, year, featured flag
- **Services**: add/edit/reorder/delete the discipline cards
- **Site settings**: brand, contact, social, AEO FAQs, colors, logo/favicon
- **Media library**: drag-and-drop upload (local in dev, Cloudinary in production), copy-URL action

### Shared DB (`packages/db`)
- `User`, `Page`, `Project`, `Service`, `BlogPost`, `Media`, `SiteSettings`
- All translatable content stored as `{ en: "…", fr: "…" }` JSON; slugs are separate columns for uniqueness
- `LOCALES = ['en', 'fr']` is a single constant — change it in `src/i18n.ts` and the schema picks it up

---

## Local development

```bash
# 1. Install everything
npm install

# 2. Create your env file at the repo root
cp .env.example .env
# Edit .env: set DATABASE_URL (Neon or local Postgres), ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET

# 3. Generate the Prisma client and push the schema
npm run db:generate
npm run db:push

# 4. Seed an admin user and sample content
npm run db:seed

# 5. Run both apps in two terminals
npm run dev:web      # http://localhost:3000  — public site
npm run dev:admin    # http://localhost:3001  — admin login
```

Log in at `http://localhost:3001/login` with the credentials from `.env`.

**Tip**: `npm run db:studio` opens Prisma Studio if you need to poke at rows directly.

---

## Deploying to Vercel + Neon

### One-time setup

1. **Create a Neon database**
   - Sign in at [neon.tech](https://neon.tech), create a project
   - Copy the pooled connection string — looks like `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require`

2. **Push the schema and seed**
   ```bash
   DATABASE_URL="<neon-url>" npm run db:push
   DATABASE_URL="<neon-url>" ADMIN_EMAIL="…" ADMIN_PASSWORD="…" npm run db:seed
   ```

3. **Generate a session secret**
   ```bash
   openssl rand -base64 32
   ```

### Deploy the public site

1. Import the repo into Vercel and create a new project
2. **Root Directory**: `apps/web`
3. Framework: Next.js (auto-detected from `vercel.json`)
4. Environment variables:
   - `DATABASE_URL` — Neon pooled URL
   - `NEXT_PUBLIC_SITE_URL` — your production domain (e.g. `https://thevision.studio`)
   - `ADMIN_SESSION_SECRET` — same value as the admin app (used to verify preview tokens)
5. Deploy. Attach your custom domain in Vercel → Settings → Domains.

### Deploy the admin panel

1. Create a **second** Vercel project from the same repo
2. **Root Directory**: `apps/admin`
3. Environment variables:
   - `DATABASE_URL` — same Neon URL as the public site
   - `NEXT_PUBLIC_SITE_URL` — public site URL (used to build the preview iframe src)
   - `ADMIN_SESSION_SECRET` — the 32-byte secret from step 3 above
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — required for production uploads (Vercel's filesystem is read-only)
4. Deploy. Attach a subdomain like `admin.thevision.studio`.

Both apps share the same Neon database, so any edit in the admin shows up on the public site after a refresh (or instantly via Vercel's ISR if you add `revalidateTag`).

---

## How content authoring works

1. Designer logs into `admin.thevision.studio`
2. Goes to **Pages**, clicks the page she wants to edit (or **+ New page**)
3. Adds/edits blocks in the left pane — every change instantly re-renders the right-side iframe preview
4. Clicks **Save draft** to persist without publishing, or **Publish** to push live
5. The public site reads `status: PUBLISHED` rows only — drafts stay hidden

To add a new page: **Pages → + New page**, fill in titles + slugs (EN + FR), then start adding blocks. Set "This is the home page" to make a page the landing route.

To delete a page: open it, go to the **Settings** tab, **Delete page** (the home page is protected).

---

## SEO & AEO checklist

✅ Per-page meta title / description / keywords (bilingual)
✅ Canonical URLs and `hreflang` alternates on every page
✅ OpenGraph + Twitter Card on every page
✅ `sitemap.xml` auto-generated from DB (with `lastmod` and alternates)
✅ `robots.txt` allows traditional + AI crawlers
✅ JSON-LD: `Person`, `Organization` on home; `CreativeWork` on projects; `FAQPage` on any page with an FAQ block; `BreadcrumbList` everywhere
✅ Semantic HTML, alt text on every image, descriptive link text
✅ Fully server-rendered — AI crawlers see the real content, not a JS shell

---

## File map

```
roua/
├── apps/web/
│   ├── app/
│   │   ├── [locale]/                  i18n-routed pages
│   │   │   ├── page.tsx               home (reads Page where isHome=true)
│   │   │   ├── [slug]/page.tsx        any other CMS page
│   │   │   └── projects/[slug]/       project listing + detail
│   │   ├── api/contact/route.ts       contact form endpoint
│   │   ├── preview/[id]/page.tsx      draft preview (admin iframes this)
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── layout.tsx
│   ├── components/blocks/             one component per block type
│   └── lib/{seo,jsonld,locale}.ts
│
├── apps/admin/
│   ├── app/
│   │   ├── login/                     unauthenticated
│   │   ├── (dashboard)/               middleware-protected
│   │   │   ├── pages/{,new,[id]}      page CRUD
│   │   │   ├── projects/{,new,[id]}   project CRUD
│   │   │   ├── services/              services CRUD
│   │   │   ├── media/                 upload + library
│   │   │   └── settings/              global site config
│   │   └── api/{auth,pages,projects,services,settings,upload,media}
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── PageEditor.tsx             3-tab editor + preview iframe
│   │   ├── BlockList.tsx              add/reorder/edit blocks
│   │   ├── ProjectEditor.tsx
│   │   ├── ServicesEditor.tsx
│   │   ├── SettingsEditor.tsx
│   │   └── MediaLibrary.tsx
│   ├── lib/{session,id}.ts
│   └── middleware.ts                  JWT auth gate
│
└── packages/db/
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts                    creates admin user + The Vision content
    └── src/
        ├── index.ts                   Prisma client singleton + re-exports
        ├── i18n.ts                    LOCALES, DEFAULT_LOCALE, t() helper
        └── types.ts                   Block union, BLOCK_TYPES
```

---

## Next things to wire up (not built yet)

- **Email** for the contact form — currently stored in `Media` as text. Drop in [Resend](https://resend.com) by editing `apps/web/app/api/contact/route.ts`
- **Drag-and-drop block reorder** — current UX uses ↑/↓ buttons (works fine, but DnD is nicer; reach for `@dnd-kit/sortable`)
- **Blog posts** — schema exists (`BlogPost` model), public + admin routes not yet built
- **Rate limiting** on `/api/contact` — Vercel KV or Upstash Ratelimit
- **OG image generator** — `app/og/route.ts` with `next/og` for auto-generated share images
