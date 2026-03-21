# Supabase Setup

## 1. Environment variables

The local app now expects:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

## 2. Database schema

Run [`supabase/schema.sql`](./schema.sql) in the Supabase SQL editor.

That creates:

- `profiles`
- `containers`
- `assets`
- `tags`
- `container_tags`
- user profile auto-creation on auth signup
- row-level security policies

## 3. Storage bucket

Run [`supabase/storage.sql`](./storage.sql) in the Supabase SQL editor.

That creates the private `art-assets` bucket and policies so users can only access files stored under their own folder path.

Recommended object path format:

```txt
<user-id>/<container-id>/<filename>
```

## 4. Next integration steps

After the SQL is applied, the next code step is:

- replace demo auth with Supabase Auth
- replace IndexedDB container persistence with Supabase tables
- replace data URL image storage with Supabase Storage uploads

The existing client file for that work is [`lib/supabase.ts`](../lib/supabase.ts).
