# 🌿 Nature Explorer

A social app for discovering and sharing nature spots. Built with Next.js 14 + Supabase.

## Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/nature-explorer.git
cd nature-explorer
npm install
```

### 2. Set Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://zkiomwvcjwhvlxyveypu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Set Up Supabase Database
1. Go to your Supabase dashboard
2. Click **SQL Editor** in the left sidebar
3. Paste the entire contents of `supabase-schema.sql`
4. Click **Run**

### 4. Set Up Supabase Storage
1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it: `nature-images`
4. Check **Public bucket**
5. Click **Create bucket**

### 5. Enable Google Auth (optional)
1. Go to **Authentication → Providers** in Supabase
2. Enable Google
3. Add your Google OAuth credentials

### 6. Run Locally
```bash
npm run dev
```
Open http://localhost:3000

### 7. Deploy to Vercel
1. Push your code to GitHub
2. Go to vercel.com → New Project
3. Import your GitHub repo
4. Add your environment variables in Vercel dashboard
5. Deploy!

## Features
- 📸 Share nature photos (up to 10 per post)
- 🗺️ Explore spots on a map
- 👍 Like, dislike, bookmark posts
- 💬 Comment on posts
- 🎥 Video feed
- 👤 User profiles with photo editing
- 🔖 Saved posts
- 📍 GPS coordinates with Google Maps link

## Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel
