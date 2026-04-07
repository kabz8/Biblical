# Biblical Financial Courses (BFC) — Platform Documentation

**Version:** 1.0 | **Prepared for:** Client Handover | **Date:** April 2026

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Getting Started — For Users](#2-getting-started--for-users)
3. [Site Navigation Map](#3-site-navigation-map)
4. [Faith Activities — Full Guide](#4-faith-activities--full-guide)
5. [Along Activities — Full Guide](#5-along-activities--full-guide)
6. [Courses — Full Guide](#6-courses--full-guide)
7. [Admin Dashboard — CMS Guide](#7-admin-dashboard--cms-guide)
8. [Multi-Language Support](#8-multi-language-support)
9. [Admin Credentials & Security](#9-admin-credentials--security)
10. [Technical Overview](#10-technical-overview)
11. [Frequently Asked Questions](#11-frequently-asked-questions)

---

## 1. Platform Overview

**Biblical Financial Courses (BFC)** is a premium, faith-based online learning platform that combines biblical financial education with community worship, interactive games, and spiritual growth tools.

### Mission

To equip believers across the world to manage money according to God's Word — through structured courses, community activities, and Scripture-centred engagement.

### Core Pillars

| Pillar | Description |
|---|---|
| **Learn** | Premium courses on biblical finance — stewardship, debt freedom, investing, and generosity |
| **Worship** | Tools for personal and communal worship — hymns, devotionals, and live worship sessions |
| **Community** | Along Activities that connect believers globally — singing, playing, praying together |
| **Play** | Interactive Faith Games that teach Scripture through fun Bible quizzes, word searches, and crossword puzzles |
| **Inspire** | Testimonies of God's financial provision shared by community members worldwide |

### Supported Languages

The platform fully supports **5 languages**:
- 🇬🇧 **English** (default)
- 🇰🇪 **Swahili (SW)**
- 🇫🇷 **French (FR)**
- 🇸🇦 **Arabic (AR)** — with right-to-left layout support
- 🇧🇷 **Portuguese (PT)**

Users can switch languages at any time using the language selector in the navigation bar.

---

## 2. Getting Started — For Users

### Creating an Account

1. Visit the site and click **"Login"** or **"Register"** in the top navigation bar.
2. Click the **"Register"** tab on the login page.
3. Fill in:
   - First Name
   - Last Name
   - Email Address
   - Password (minimum 6 characters)
4. Click **"Create Account"** — you are immediately logged in.

### Logging In

1. Go to the login page (`/auth`)
2. Enter your registered **email** and **password**
3. Click **"Login"**

### Your Dashboard

Once logged in, your personal dashboard (`/dashboard`) shows:
- Your enrolled courses and progress
- Recently accessed content
- Recommended next steps

---

## 3. Site Navigation Map

The site has two main navigation sections accessible from the header:

### Top Navigation Bar
| Link | Route | Description |
|---|---|---|
| Home | `/` | Landing page with featured courses and platform overview |
| Courses | `/courses` | Browse all 6 available courses with filters |
| Login / Register | `/auth` | User authentication |
| Dashboard | `/dashboard` | Personal learning dashboard (logged-in users only) |

### Faith Activities Menu
| Activity | Route | Description |
|---|---|---|
| Worship | `/worship` | Personal worship tools, hymns, devotionals |
| Reading | `/reading` | Biblical reading plans and study |
| Meditation | `/meditation` | Scripture meditation and reflection |
| Games | `/games` | Interactive Bible games hub |
| Testimonies | `/testimonies` | Community testimony wall |
| Prayers | `/prayers` | Prayer community and requests |

### Along Activities Menu
| Activity | Route | Description |
|---|---|---|
| Sing Along | `/sing-along` | Community worship songs with lyrics and chord charts |
| Game Along | `/game-along` | Live multiplayer Bible games and tournaments |
| Meditate Along | `/meditate-along` | Group guided meditation sessions |
| Read Along | `/read-along` | Community Bible reading groups |
| Pray Along | `/pray-along` | Corporate prayer sessions |
| Testimony Along | `/testimony-along` | Group testimony sharing |

---

## 4. Faith Activities — Full Guide

Faith Activities are **personal, individual** spiritual engagement tools. Users engage with these on their own time and at their own pace.

### 4.1 Worship (`/worship`)

The Worship page provides:

- **Live Worship Service Schedule** — Three recurring weekly live-stream sessions:
  - Sunday 10:00 AM — Morning Worship Service
  - Wednesday 7:00 PM — Midweek Praise Night
  - Friday 8:00 PM — Glory Night Extended Worship
- **Hymn & Song Library** — All worship songs uploaded by the admin appear here with lyrics and chord charts. Users can expand any song to view full lyrics and chords.
- **Biblical Foundations of Worship** — Scripture insights on why and how believers worship
- **Daily Worship Devotionals** — Scripture-based reflections updated regularly

### 4.2 Games (`/games`)

The Games page is an interactive hub with **three playable games** — all content-managed through the Admin Dashboard:

#### Multiple Choice Quiz
- Scripture-based questions on biblical finance and faith
- 4 answer options per question (A, B, C, D)
- Immediate feedback after each answer with correct answer revealed
- Score tracker and final results with percentage
- **Content source:** Questions added by admin through the CMS

#### Word Search
- Find hidden Bible words in an interactive 18×18 grid
- Two categories: **Places in the Bible** and **New Testament Books**
- Click a starting letter, then click the ending letter to select a word
- Words can be placed horizontally, vertically, or diagonally
- Found words are highlighted in green
- **Content source:** Words added by admin through the CMS

#### Crossword Puzzle
- Choose from a list of admin-created crossword puzzles
- Interactive grid — click a clue to highlight the word location
- Type letters directly into the grid cells
- "Check" mode reveals correct/incorrect letters in real time
- Celebration screen when puzzle is completed
- **Content source:** Puzzles created by admin through the CMS

### 4.3 Testimonies (`/testimonies`)

- Displays all community testimonies published by the admin
- Each testimony shows: name, location, category badge, title, and full story
- Categories include: Debt Freedom, Business Breakthrough, Family Restoration, Job Miracle, Home Purchased, Investment Win, General
- Empty state shown if no testimonies have been published yet

### 4.4 Reading, Meditation, Prayers

These pages provide biblical reading plans, guided Scripture meditation, and community prayer features. Content is delivered through rich, structured layouts designed to deepen personal faith.

---

## 5. Along Activities — Full Guide

Along Activities are **community-based** experiences — designed so believers participate *together* in real time or as part of an ongoing community stream.

> **Key Difference:** Faith Activities = Personal growth at your own pace. Along Activities = Joining with the broader community in shared experience.

### 5.1 Sing Along (`/sing-along`)

- Displays all **Sing Along songs** uploaded by the admin
- Each song shows: title, artist, category, key, tempo
- Expand any song to view full **lyrics and chord charts**
- Includes a **Worship Tips** section with guidance for individual and group singing
- Songs are filtered by admin setting — only songs marked "Sing Along" or "Both" appear here

### 5.2 Game Along (`/game-along`)

Community multiplayer gaming experience:
- **Live Game Sessions** — Six concurrent session types: Bible Trivia, Scripture Memory, Bible Characters, Parable Puzzles, Worship Songs, and Bible Geography
- **Upcoming Tournaments** — Scheduled tournaments with prizes and registration
- **Game Categories** — Browse Bible Trivia, Memory Games, Bible Characters, and Word Puzzles
- **Community Gaming Stats** — Platform-wide player and game statistics

### 5.3 Other Along Activities

| Activity | Description |
|---|---|
| **Meditate Along** | Guided group meditation with scripture focus and breathing exercises |
| **Read Along** | Community reading groups following shared biblical reading plans |
| **Pray Along** | Live corporate prayer sessions and prayer request wall |
| **Testimony Along** | Community testimony sharing and encouragement sessions |

---

## 6. Courses — Full Guide

### Browsing Courses (`/courses`)

The courses page shows all 6 available courses with filters:
- **Filter by Level:** Beginner, Intermediate, Advanced
- **Filter by Track:** Foundations, Investing, Debt Freedom, Generosity

### Available Courses

| # | Course | Track | Level | Price | Duration |
|---|---|---|---|---|---|
| 1 | Stewardship 101 | Foundations of Stewardship | Beginner | Free | 4 hours |
| 2 | Budgeting Masterclass | Foundations of Stewardship | Intermediate | $99 | 6 hours |
| 3 | Kingdom Investing Principles | Kingdom Investing | Intermediate | $149 | 8 hours |
| 4 | Retirement God's Way | Kingdom Investing | Advanced | $129 | 5 hours |
| 5 | The Debt Freedom Plan | Debt-Free Living | Beginner | $79 | 6 hours |
| 6 | Radical Generosity | The Generous Life | Beginner | Free | 3 hours |

### Course Tracks

1. **Foundations of Stewardship** — Biblical principles of managing money and resources with wisdom and faith
2. **Kingdom Investing** — Investing resources for eternal impact, growth, and generosity
3. **Debt-Free Living** — Biblical strategies for eliminating debt and building financial freedom
4. **The Generous Life** — The joy and biblical mandate of radical, joyful giving

### Course Experience

Each course page includes:
- Full course overview and curriculum
- Instructor details
- Level and duration indicators
- Price (free or paid)
- Enrol button
- Related courses

---

## 7. Admin Dashboard — CMS Guide

The Admin Dashboard is your **complete content management system**. Everything that appears in the games, songs, and testimonies sections is managed here.

### Accessing the Admin Dashboard

1. Navigate to: `https://[your-site-url]/admin`
2. Enter admin credentials (see Section 9)
3. You will be taken directly to the CMS dashboard

### Dashboard Tabs

The dashboard has **5 content tabs**:

---

#### Tab 1: Songs

Manage all music content for both the **Sing Along** and **Worship** pages.

**Adding a new song:**
1. Click the **Songs** tab
2. Fill in the form:
   - **Title** *(required)* — Song name, e.g. "Amazing Grace"
   - **Artist** — Songwriter or performer name
   - **Category** — Choose: Worship, Hymn, Gospel, or Contemporary
   - **Display On** *(required)* — Choose where the song appears:
     - *Sing Along page* — appears only on `/sing-along`
     - *Worship page* — appears only on `/worship`
     - *Both pages* — appears on both pages
   - **Key** — Musical key, e.g. "G", "D", "C"
   - **Tempo** — e.g. "72 BPM" or "Slow"
   - **Lyrics** — Paste the full song lyrics
   - **Chords** — Paste chord chart or guitar tab notation
3. Click **"Add Song"**

**Deleting a song:** Click the red trash icon next to any song in the list below the form.

---

#### Tab 2: Quiz Questions

Manage all questions for the **Multiple Choice Quiz** game.

**Adding a question:**
1. Click the **Quiz Questions** tab
2. Fill in:
   - **Scripture Reference** *(required)* — e.g. "Matthew 6:24"
   - **Correct Answer** — Select which option (A, B, C, or D) is correct. The selected option's input turns green.
   - **Question** *(required)* — The question text
   - **Option A, B, C, D** — The four answer choices
3. Click **"Add Question"**

**Note:** Questions appear immediately in the live quiz game after saving.

**Deleting a question:** Click the red trash icon next to any question.

> **Your custom questions:** If you had specific questions that were previously in the system, please re-enter them here. The current questions in the system are 8 starter/default questions covering Matthew 6:24, Proverbs 22:7, Malachi 3:10, Luke 16:11, Philippians 4:19, Deuteronomy 8:18, Proverbs 13:11, and 1 Timothy 6:10.

---

#### Tab 3: Word Search

Manage all words for the **Word Search** game. Words are grouped into two categories.

**Adding a word:**
1. Click the **Word Search** tab
2. Fill in:
   - **Word** *(required)* — e.g. "BETHLEHEM" (automatically converted to uppercase)
   - **Category** — Choose:
     - *Places in the Bible* — geographical locations
     - *New Testament Books* — book names from the NT
3. Click **"Add Word"**

Words appear immediately in the word search game grid. Longer words take priority in placement.

**Current default words loaded:**
- *Places:* BETHLEHEM, JERUSALEM, NAZARETH, JERICHO, GALILEE, BETHANY, CAPERNAUM, JORDAN, SINAI, EDEN
- *NT Books:* MATTHEW, MARK, LUKE, JOHN, ACTS, ROMANS, GALATIANS, EPHESIANS, HEBREWS, REVELATION

---

#### Tab 4: Crossword

Create interactive crossword puzzles for the **Crossword Puzzle** game.

**Creating a crossword:**
1. Click the **Crossword** tab
2. Enter a **Puzzle Title** — e.g. "Biblical Finance Basics"
3. Enter **Word & Clue Pairs** — one per line in this format:
   ```
   TITHE|What we give to God as firstfruits
   STEWARD|One who manages another's resources
   FAITH|Trust and confidence in God
   GRACE|Unmerited favour from God
   DEBT|What the borrower owes the lender
   WISDOM|Godly insight for sound decisions
   ```
4. Click **"Generate Preview"** — the system automatically lays out the crossword grid and shows you how many words were placed and the clues list
5. If satisfied, click **"Save Crossword"**

**Tips for best results:**
- Use 6–15 words per puzzle
- Words with shared letters create more intersections
- Aim for 4–10 character words for best grid density
- Bible finance terms work great: TITHE, STEWARD, FAITH, GRACE, DEBT, SOWING, REAPING, WISDOM, TRUST, BLESSING, MONEY

**Deleting a puzzle:** Click the red trash icon next to any saved puzzle.

---

#### Tab 5: Testimonies

Manage all testimonies displayed on the **Testimonies** page (`/testimonies`).

**Adding a testimony:**
1. Click the **Testimonies** tab
2. Fill in:
   - **Name** *(required)* — Full name of the person sharing
   - **Location** — City and country, e.g. "Nairobi, Kenya 🇰🇪"
   - **Category** — Choose the type of testimony:
     - Debt Freedom
     - Business Breakthrough
     - Family Restoration
     - Job Miracle
     - Home Purchased
     - Investment Win
     - General
   - **Title** *(required)* — A compelling headline for the testimony
   - **Story** *(required)* — The full testimony text
3. Click **"Add Testimony"**

**Deleting a testimony:** Click the red trash icon next to any testimony.

---

## 8. Multi-Language Support

The platform supports 5 languages accessible from the language selector in the navigation bar.

| Code | Language | Script Direction |
|---|---|---|
| EN | English | Left to Right |
| SW | Swahili | Left to Right |
| FR | French | Left to Right |
| AR | Arabic | Right to Left (RTL) |
| PT | Portuguese | Left to Right |

- Language preference is saved per session
- All static UI elements translate automatically
- Admin-entered content (songs, testimonies, questions) is stored as entered — for multilingual content, create separate entries in each language

---

## 9. Admin Credentials & Security

### Admin Login Details

| Field | Value |
|---|---|
| **URL** | `https://[your-site-url]/admin` |
| **Email** | `admin@biblicalfinancialcourses.com` |
| **Password** | `Mango2026!?` |

> **Security Note:** Please change the admin password after your first login by contacting your developer. The admin area is protected by server-side authentication — only the admin email can access the CMS. Any other user who tries to access `/admin` will see the login screen and cannot proceed without the exact admin credentials.

### How Admin Security Works

- The admin login is completely separate from regular user accounts
- The admin session is server-authenticated using encrypted passwords (bcrypt)
- Non-admin users cannot access any admin API endpoints — all admin routes return a `403 Forbidden` error if accessed without admin credentials
- Admin content changes take effect immediately on the live site — no publishing step required

---

## 10. Technical Overview

> *This section is for technical reference. Share with your developer team as needed.*

### Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui component library |
| **Routing** | Wouter (lightweight client-side router) |
| **State / Data** | TanStack Query v5 (React Query) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Supabase or Replit-hosted) |
| **ORM** | Drizzle ORM |
| **Authentication** | Passport.js (local strategy), bcrypt password hashing |
| **i18n** | i18next with 5-language support |
| **Fonts** | DM Sans + Inter (Google Fonts) |
| **Icons** | Lucide React |
| **Hosting** | Vercel (recommended) or Replit |

### Database Tables

| Table | Purpose |
|---|---|
| `users` | Registered user accounts |
| `profiles` | Extended user profile data |
| `tracks` | Course tracks/categories |
| `courses` | Course listings and metadata |
| `modules` | Course modules |
| `lessons` | Individual lessons within modules |
| `enrollments` | User-course enrolment records |
| `progress` | Per-lesson completion tracking |
| `songs` | Songs for Sing Along and Worship pages |
| `quiz_questions` | Multiple choice quiz questions |
| `word_search_words` | Words for the word search game |
| `crossword_puzzles` | Crossword puzzle data (JSON grid layout) |
| `testimonies` | Community testimonies |
| `activity_submissions` | User-submitted faith activity records |

### Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/user` | Get current logged-in user |
| POST | `/api/login` | Log in |
| POST | `/api/register` | Create account |
| POST | `/api/logout` | Log out |
| GET | `/api/courses` | List all courses |
| GET | `/api/songs` | List all songs |
| GET | `/api/quiz-questions` | List quiz questions |
| GET | `/api/word-search-words` | List word search words |
| GET | `/api/crosswords` | List crossword puzzles |
| GET | `/api/testimonies` | List testimonies |
| POST | `/api/admin/songs` | Add a song *(admin only)* |
| POST | `/api/admin/quiz-questions` | Add a quiz question *(admin only)* |
| POST | `/api/admin/word-search-words` | Add a word *(admin only)* |
| POST | `/api/admin/crosswords` | Add a crossword *(admin only)* |
| POST | `/api/admin/testimonies` | Add a testimony *(admin only)* |
| DELETE | `/api/admin/songs/:id` | Delete a song *(admin only)* |
| DELETE | `/api/admin/quiz-questions/:id` | Delete a question *(admin only)* |
| DELETE | `/api/admin/word-search-words/:id` | Delete a word *(admin only)* |
| DELETE | `/api/admin/crosswords/:id` | Delete a crossword *(admin only)* |
| DELETE | `/api/admin/testimonies/:id` | Delete a testimony *(admin only)* |

---

## 11. Frequently Asked Questions

**Q: How do I add my custom quiz questions?**
Go to `/admin`, log in, click "Quiz Questions", and add each question with its 4 options and the correct answer. Questions appear in the game immediately.

**Q: Why are the games empty for users?**
Games fetch content from the Admin Dashboard. If no questions/words/crosswords have been added, the game shows an empty state. Use the admin panel to populate content.

**Q: Can I add songs in multiple languages?**
Yes — add a separate song entry for each language version. Name them clearly (e.g., "Amazing Grace (French)") and set the appropriate display page.

**Q: What happens when I delete content from the admin dashboard?**
Deletions are permanent and take effect immediately on the live site. There is no recycle bin, so confirm before deleting.

**Q: Can regular users see the Admin Dashboard?**
No. Only the account with the admin email address can access the CMS. Any other user who visits `/admin` sees a login form they cannot pass through.

**Q: How do I change the admin password?**
Contact your developer to update the admin password in the server configuration. This requires a code change and redeployment.

**Q: How many crossword puzzles can I create?**
There is no limit. Users see all saved crosswords listed on the crossword picker screen and can choose which one to play.

**Q: Can I preview a crossword before saving it?**
Yes — click "Generate Preview" after entering your word/clue pairs. The system shows you how many words were placed, the grid size, and all Across/Down clues. Only click "Save Crossword" when you are satisfied.

**Q: Are user passwords secure?**
Yes. All passwords are hashed using bcrypt (12 salt rounds) before storage. Plain text passwords are never saved to the database.

**Q: How does language switching work?**
The language selector in the navigation bar changes all static site text instantly. The user's language preference is saved for the session. Admin-entered content (songs, testimonies, questions) displays as entered, regardless of language setting.

---

*Document prepared by the BFC development team. For technical support or additional features, contact your developer.*
