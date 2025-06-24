# ✨ Sava — A Private AI-Powered Paper Trail App

Sava is a minimal, intelligent journaling tool that helps you capture moments, events, and work-related logs in structured form — and stores them privately in your own Google Drive.

Perfect for:

- Creating a defensible paper trail in chaotic work environments
- Emotional processing and reflection
- Personal journaling with AI-assisted structure

---

## 🧠 Features

- ✍️ Freeform text input → Structured journal entry via GPT-4
- 🧾 Automatically formats entries as Markdown
- ☁️ Saves logs to a dedicated `Sava` folder in your **own Google Drive**
- 🔐 Authenticated via Google OAuth (your data is yours)
- 🧠 AI-generated fields: title, summary, tags, people, sentiment, etc.
- 💾 (Planned) Offline-first mode, search, and Smart Views

---

## 🔧 Tech Stack

| Layer      | Tech                               |
| ---------- | ---------------------------------- |
| Frontend   | Next.js (App Router), Tailwind CSS |
| AI         | OpenAI GPT-4o (via API)            |
| Auth       | next-auth + Google OAuth           |
| Storage    | Google Drive API (user-owned)      |
| Deployment | Vercel / Coolify (self-hosted)     |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/sava.git
cd sava
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up `.env.local`

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# next-auth
NEXTAUTH_SECRET=generate-with-openssl
NEXTAUTH_URL=http://localhost:3000
```

> Make sure to enable Google Drive API in your Google Cloud Console and configure OAuth credentials with redirect URI:
> `http://localhost:3000/api/auth/callback/google`

### 4. Run the app

```bash
npm run dev
```

---

## 📁 Folder Structure

```
/app
  /api
    /auth/[...nextauth]    → Google OAuth setup
    /structure-entry        → AI-powered structuring
    /upload-to-drive        → Upload .md files to Google Drive
/components                → AuthStatus, EntryForm, etc.
/lib
  authOptions.ts           → next-auth shared config
  uploadToDrive.ts         → Drive API logic
  formatEntryMarkdown.ts   → Markdown formatter
```

---

## 📦 Roadmap

- [x] GPT-4o entry structuring
- [x] Google OAuth with per-user Drive
- [x] Markdown file upload to "Sava" folder
- [x] Folder ID caching in session
- [ ] Offline storage (IndexedDB)
- [ ] Searchable history view
- [ ] Daily journaling reminders
- [ ] Smart tagging and entry linking

---

## 🛡️ Privacy & Ownership

- All entries are stored in your **own** Google Drive
- Sava does not store your data or access it beyond the current session
- OAuth scopes are limited to `drive.file` — your app can only see/edit what it creates

---

## 📄 License

MIT — do what you like, but please respect user privacy and autonomy.

---

## 🧠 Credits

Built with ❤️ by [Matt Whalley](https://github.com/mattwhalley)
