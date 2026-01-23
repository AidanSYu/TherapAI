# TherapAI - Quick Start Guide

Get TherapAI running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- npm or yarn
- A Supabase account (free tier works)
- An OpenAI API key

## Step 1: Clone and Install (1 min)

```bash
git clone https://github.com/AidanSYu/TherapAI.git
cd TherapAI
npm install
```

## Step 2: Set Up Supabase (2 min)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize (~2 minutes)
3. Go to **Settings** → **API** to get your credentials:
   - Project URL
   - Anon/Public key
   - Service role key

4. Go to **SQL Editor** and run the migration:
   - Copy contents from `supabase/migrations/20240101000000_initial_schema.sql`
   - Paste into SQL Editor
   - Click "Run"

## Step 3: Get OpenAI API Key (1 min)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** → **Create new secret key**
4. Copy the key (you won't see it again!)

## Step 4: Configure Environment (30 sec)

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use any text editor
```

Add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Run! (30 sec)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Testing the App

### Test as Patient:
1. Click **"Patient Portal"** on landing page
2. Click **"Sign Up"** on login page
3. Enter email and password
4. Check your email for verification link
5. After verification, log in
6. Start chatting with AI therapist!

### Test as Doctor:
1. Sign up as a patient first (above)
2. Go to Supabase Dashboard → **Authentication** → **Users**
3. Find your user and click to edit
4. Go to **Database** → **users** table
5. Update your `role` from `patient` to `doctor`
6. Log out and log back in
7. You'll see the Doctor Dashboard!

## Troubleshooting

### "Failed to fetch from Supabase"
- Check your Supabase URL and keys in `.env`
- Make sure the database migration ran successfully

### "OpenAI API error"
- Verify your OpenAI API key is correct
- Check you have credits/billing set up on OpenAI

### "Cannot find module"
- Run `npm install` again
- Delete `node_modules` and `.next`, then reinstall

### Port 3000 already in use
- Change port: `npm run dev -- -p 3001`

## What's Next?

- Read [README.md](README.md) for full documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details

## Need Help?

- GitHub Issues: [github.com/AidanSYu/TherapAI/issues](https://github.com/AidanSYu/TherapAI/issues)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)

---

**Happy Building! 🚀**
