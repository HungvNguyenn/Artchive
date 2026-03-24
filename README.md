# Artchive

Artchive is a Web application designed to help many artist keep track of their reference photos, notes, and sketches all in one place. Each drawing has a container that holds anything related to that art piece together. This allows everything to be together without the hassle of looking at different sites. 

## Features
- Upload and organize sketches, reference images, and final artwork
- Add notes to keep artistic context and ideas with the piece
- Arrange assets visually on a corkboard-style board
- Tag and search artwork for faster finding and sorting

## Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript, custom CSS
- **Backend:** Supabase
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth)
- **Storage:** Supabase Storage (image storage)
- **Deployment:** Vercel

## Local Development

1. Clone the repository:
  ```bash
   git clone https://github.com/HungvNguyenn/Artchive.git
   cd Artchive
   ```
2. Install dependencies:
  ```bash
  npm install
  ```

3. create a .env.local file in the project root and add:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
  ```
4. start developement server:
  ```bash
  npm run dev
  ```
  Open http://localhost:3000 with your browser to see the result.

## Architecture

Artchive uses Next.js for the frontend and Supabase for authentication, database, and image storage. Users can create containers for artwork, upload assets, add notes, and manage everything in a corkboard-style workspace.

## License

This project is for educational and portfolio purposes unless otherwise stated.

