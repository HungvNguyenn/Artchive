# Artchive

Artchive is a Next.js MVP for a corkboard-style art organization SaaS. Each artwork gets a dedicated container for references, sketches, final images, notes, and tags.

## What is included

- Email-style demo sign-in flow
- Container creation, editing, deletion
- Tagging, search, and filtering
- Image uploads stored in browser local storage for the MVP
- Note pinning
- Draggable corkboard layout
- Supabase-ready environment setup for future auth, database, and storage integration

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Supabase integration path

This MVP currently uses a local browser persistence layer in `lib/storage.ts`. The UI contracts are intentionally shaped so the next step is swapping these methods for:

- Supabase Auth for sign up / login
- Postgres tables for users, containers, tags, and assets
- Supabase Storage buckets for uploaded images

Environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Suggested schema

- `containers`: `id`, `user_id`, `name`, `description`, `status`, `medium`, `created_at`, `updated_at`
- `assets`: `id`, `container_id`, `type`, `title`, `image_path`, `note`, `x`, `y`, `rotation`, `created_at`, `updated_at`
- `tags`: `id`, `name`
- `container_tags`: `container_id`, `tag_id`

## Deployment

- Frontend: Vercel
- Backend/Auth/Storage: Supabase

When you are ready, add the Supabase keys in Vercel environment variables and replace the local storage adapter with live queries.
