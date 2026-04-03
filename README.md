# 🌱 Deutsch Aktiv - Phase 2B (Next.js + Supabase)

Professional multi-user German vocabulary learning app with authentication, database, and all advanced features.

---

## 🚀 FEATURES

### ✅ Core Features
- **Multi-user authentication** (email/password via Supabase)
- **Shared vocabulary database** (240+ words, all users can access)
- **Private practice sessions** (each user's progress is private)
- **Three practice modes:**
  - Daily Practice (write sentences, grammar check, rate confidence)
  - Translation Test (type English + Spanish translations)
  - Fill in the Blank (complete sentences)
- **Grammar checking** (LanguageTool API integration)
- **Translation toggle** (hide/show translations during practice)
- **Priority star marking** (mark important words, they appear 2x more)
- **Auto-translation** (MyMemory API for adding new words)
- **Reflexive verb detection** (suggests adding "sich" automatically)
- **Preposition lookup** (auto-fills common prepositions)
- **Progress tracking** (circular progress, streak counter, stats)
- **Data export** (download practice history as .txt)
- **Fully responsive** (works on phone + computer)

### 🎨 Design
- Moodboard-inspired Pantone color palette
- Organic shapes, soft shadows
- Fraunces serif + Plus Jakarta Sans fonts
- Smooth animations and transitions

---

## 📦 TECH STACK

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS
- **APIs:** LanguageTool (grammar), MyMemory (translation)
- **Deployment:** Vercel

---

## 🛠️ SETUP INSTRUCTIONS

### **STEP 1: Clone and Install**

```bash
cd deutsch-aktiv-nextjs
npm install
```

### **STEP 2: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project name:** deutsch-aktiv
   - **Database password:** (save this!)
   - **Region:** Choose closest to you
4. Click "Create new project"
5. Wait ~2 minutes for project to be ready

### **STEP 3: Run Database Schema**

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the ENTIRE contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click "Run" (bottom right)
6. Wait for success message ✓

This creates:
- All tables (vocabulary, practice_sessions, user_stats)
- Row Level Security policies
- Initial 240 words loaded
- Triggers for auto-creating user stats

### **STEP 4: Get Supabase Credentials**

1. In Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### **STEP 5: Create Environment Variables**

1. In your project folder, create `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and paste your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### **STEP 6: Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the login page! 🎉

### **STEP 7: Test It**

1. Click "Registrieren"
2. Enter email + password (min 6 chars)
3. Check your email for confirmation link
4. Click link to confirm
5. Login
6. You're in! 🌱

---

## 🚀 DEPLOYMENT TO VERCEL

### **Option A: Via Vercel Dashboard (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repo (or upload folder)
4. In "Environment Variables" section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"
6. Wait ~2 minutes
7. Done! Your app is live at `deutsch-aktiv.vercel.app`

### **Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables when prompted
# Or add them in Vercel dashboard later
```

---

## 📊 DATABASE SCHEMA

### **vocabulary** (Shared across all users)
```sql
id: UUID (primary key)
german: TEXT (unique)
english: TEXT
spanish: TEXT
preposition: TEXT (nullable)
example: TEXT
priority: INTEGER (0 or 1)
added_by_user_id: UUID (references auth.users)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### **practice_sessions** (Private per user)
```sql
id: UUID (primary key)
user_id: UUID (references auth.users)
vocabulary_id: UUID (references vocabulary)
confidence_rating: INTEGER (1-5, nullable)
grammar_score: INTEGER (1-5, nullable)
practice_mode: TEXT ('daily' | 'translation' | 'fillblank')
practiced_at: TIMESTAMP
```

### **user_stats** (One row per user)
```sql
user_id: UUID (primary key, references auth.users)
total_practiced: INTEGER
unique_words_count: INTEGER
current_streak: INTEGER
longest_streak: INTEGER
last_practice_date: DATE (nullable)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### **Row Level Security (RLS)**

- **vocabulary:** Everyone can read, authenticated can add
- **practice_sessions:** Users can only see/manage their own
- **user_stats:** Users can only see/update their own

---

## 🎯 HOW TO USE

### **For You (Jules):**

1. **Sign up:** Use your email
2. **Daily Practice:**
   - Click "Daily Practice"
   - See German word (translations hidden)
   - Click "👁️ Übersetzung zeigen" if stuck
   - Write sentence about your life/ESN/Braunschweig
   - Click "Grammatik checken" → see score
   - Rate confidence (1-5)
   - Click "Speichern & Weiter"
3. **Translation Test:**
   - See German word
   - Type English + Spanish
   - Check answers
4. **Fill in the Blank:**
   - See sentence with _____
   - Type missing word
   - Check answer
5. **Add words:**
   - Scroll to bottom
   - Type German word
   - Click "Wort nachschlagen"
   - Auto-fills translations
   - Save

### **For Others (Multi-user):**

Same flow! Each user has:
- Their own account
- Private practice history
- Shared vocabulary (everyone benefits)

---

## 🔧 CUSTOMIZATION

### **Change Colors:**

Edit `tailwind.config.js`:

```javascript
colors: {
  pristine: '#F5F3EE',
  'crystal-rose': '#FFD6DD',
  nasturtium: '#FF6B58',
  cascade: '#2B9B8F',
  parasailing: '#1E5F57',
  'nine-iron': '#2C3338',
}
```

### **Add More Words:**

Two ways:

**1. In App:**
- Login → scroll to bottom → "Neues Wort hinzufügen"

**2. In Database:**
```sql
INSERT INTO vocabulary (german, english, spanish, preposition, example, priority)
VALUES ('das Wort', 'word', 'palabra', '', 'Das ist ein Beispiel.', 0);
```

### **Change Number of Words in Practice:**

Edit practice pages:
- `app/practice/daily/page.tsx`
- `app/practice/translation/page.tsx`
- `app/practice/fillblank/page.tsx`

Change `.slice(0, 5)` to `.slice(0, 10)` for 10 words instead of 5.

---

## 📁 PROJECT STRUCTURE

```
deutsch-aktiv-nextjs/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── login/
│   │   └── page.tsx          # Login/signup page
│   ├── practice/
│   │   ├── daily/page.tsx    # Daily practice mode
│   │   ├── translation/page.tsx
│   │   └── fillblank/page.tsx
│   ├── vocabulary/
│   │   └── page.tsx          # Browse all words
│   └── export/
│       └── page.tsx          # Export data
├── components/
│   ├── Header.tsx            # Header with logout
│   ├── ProgressHero.tsx      # Progress circle + stats
│   ├── PracticeModes.tsx     # Mode selection cards
│   ├── AddWordSection.tsx    # Add new word form
│   ├── PracticeSession.tsx   # Main practice component
│   ├── VocabularyBrowser.tsx # Search + browse words
│   └── ExportData.tsx        # Export stats
├── lib/
│   └── supabase.ts           # Supabase client config
├── supabase-schema.sql       # Database schema
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
└── .env.local.example
```

---

## 🐛 TROUBLESHOOTING

### **"Invalid login credentials"**
- Check email confirmation (check spam folder)
- Password must be at least 6 characters

### **"No vocabulary found"**
- Run the SQL schema again
- Check Supabase SQL Editor for errors

### **Grammar check not working**
- LanguageTool API may be rate-limited
- Check internet connection
- Try again in a few minutes

### **Can't add new words**
- Check you're logged in
- Check environment variables are set
- Check Supabase RLS policies

### **Deployment fails**
- Check environment variables in Vercel
- Check Supabase URL and key are correct
- Check build logs for errors

---

## 🎉 WHAT'S DIFFERENT FROM PHASE 2A?

### **Phase 2A (Single HTML File):**
- ✅ localStorage (data on one device)
- ✅ No login required
- ✅ Quick to deploy
- ❌ No multi-user
- ❌ Data not backed up

### **Phase 2B (Next.js + Supabase):**
- ✅ PostgreSQL database (data everywhere)
- ✅ Multi-user with login
- ✅ Data backed up in cloud
- ✅ Professional architecture
- ✅ Scalable

---

## 📈 FUTURE ENHANCEMENTS

Possible additions:
- Voice recording for pronunciation
- Spaced repetition algorithm (words appear based on confidence)
- Social features (leaderboards, sharing)
- Mobile app (React Native)
- More languages (French, Italian, etc.)
- AI-generated example sentences
- Progress charts and analytics
- Email reminders for practice

---

## 🙏 CREDITS

Built by Claude (Anthropic) for Jules
- Design: Moodboard-inspired Pantone palette
- APIs: LanguageTool (grammar), MyMemory (translation)
- Database: Supabase
- Hosting: Vercel

---

## 📄 LICENSE

Personal use only. Built specifically for Jules' German learning journey.

---

## ✅ QUICK START CHECKLIST

- [ ] `npm install`
- [ ] Create Supabase project
- [ ] Run `supabase-schema.sql` in SQL Editor
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add Supabase URL and key to `.env.local`
- [ ] `npm run dev`
- [ ] Sign up and test
- [ ] Deploy to Vercel
- [ ] Add environment variables in Vercel
- [ ] Test live site
- [ ] Share with friends! 🎉

---

**Ready to deploy? Let's go! 🚀**
